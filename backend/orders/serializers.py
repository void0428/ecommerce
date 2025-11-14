from rest_framework import serializers
from django.contrib.auth.models import User
from products.serializers import ProductListSerializer
from .models import Order, OrderItem, Cart, CartItem


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'size', 'price', 'subtotal']

    def to_representation(self, instance):
        """Convert DecimalField to float"""
        representation = super().to_representation(instance)
        # Convert DecimalField to float for JSON serialization
        if 'price' in representation and representation['price'] is not None:
            representation['price'] = float(representation['price'])
        if 'subtotal' in representation and representation['subtotal'] is not None:
            representation['subtotal'] = float(representation['subtotal'])
        return representation


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'status', 'total_amount', 'shipping_address',
            'phone_number', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_amount', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """Ensure items is always an array and convert Decimal to float"""
        representation = super().to_representation(instance)
        # Ensure items is always an array, even if empty
        if 'items' not in representation or representation['items'] is None:
            representation['items'] = []
        # Convert DecimalField to float for JSON serialization
        if 'total_amount' in representation and representation['total_amount'] is not None:
            representation['total_amount'] = float(representation['total_amount'])
        return representation


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'size', 'subtotal']

    def to_representation(self, instance):
        """Convert Decimal to float"""
        representation = super().to_representation(instance)
        # Convert subtotal to float (it's a property that returns Decimal)
        if 'subtotal' in representation and representation['subtotal'] is not None:
            representation['subtotal'] = float(representation['subtotal'])
        return representation


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        """Ensure items is always an array and convert Decimal to float"""
        representation = super().to_representation(instance)
        # Ensure items is always an array, even if empty
        if 'items' not in representation or representation['items'] is None:
            representation['items'] = []
        # Ensure total_items and total_amount are numbers
        if representation.get('total_items') is None:
            representation['total_items'] = 0
        if representation.get('total_amount') is None:
            representation['total_amount'] = 0
        # Convert DecimalField to float for JSON serialization
        if 'total_amount' in representation and representation['total_amount'] is not None:
            representation['total_amount'] = float(representation['total_amount'])
        return representation

