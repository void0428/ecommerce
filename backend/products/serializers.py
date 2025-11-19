from rest_framework import serializers
from django.utils.text import slugify
from django.conf import settings
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=True)
    final_price = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'category_id',
            'price', 'discount_price', 'final_price', 'discount_percentage',
            'image', 'stock', 'available_sizes', 'gender', 'is_featured',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """Override to return full image URL"""
        representation = super().to_representation(instance)
        if representation.get('image'):
            # Return the full URL path
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                # Fallback if no request context
                representation['image'] = instance.image.url
        return representation

    def validate_category_id(self, value):
        """Validate that the category exists"""
        try:
            Category.objects.get(id=value)
        except Category.DoesNotExist:
            raise serializers.ValidationError(f"Category with id {value} does not exist. Please create a category first.")
        return value

    def validate(self, attrs):
        """Validate the product data"""
        # Auto-generate slug from name if not provided
        if 'name' in attrs and not attrs.get('slug'):
            attrs['slug'] = slugify(attrs['name'])
        
        # Ensure slug is unique
        slug = attrs.get('slug')
        if slug:
            existing = Product.objects.filter(slug=slug)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    'name': 'A product with this name already exists. Please use a different name.'
                })
        
        return attrs

    def create(self, validated_data):
        """Create a new product with auto-generated slug"""
        category_id = validated_data.pop('category_id')
        category = Category.objects.get(id=category_id)
        
        # Generate slug from name if not provided
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])
        
        product = Product.objects.create(category=category, **validated_data)
        return product

    def update(self, instance, validated_data):
        """Update an existing product"""
        if 'category_id' in validated_data:
            category_id = validated_data.pop('category_id')
            category = Category.objects.get(id=category_id)
            instance.category = category
        
        # Update slug if name changed
        if 'name' in validated_data:
            instance.slug = slugify(validated_data['name'])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    final_price = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'price', 'discount_price',
            'final_price', 'discount_percentage', 'image', 'stock',
            'available_sizes', 'gender', 'is_featured'
        ]

    def to_representation(self, instance):
        """Override to return full image URL"""
        representation = super().to_representation(instance)
        if representation.get('image'):
            # Return the full URL path
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                # Fallback if no request context
                representation['image'] = instance.image.url
        return representation

