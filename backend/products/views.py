from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductListSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        """Filter categories by gender if provided"""
        queryset = Category.objects.all()
        gender = self.request.query_params.get('gender', None)
        
        if gender:
            # Return only categories that have at least one product with this gender
            queryset = queryset.filter(products__gender=gender).distinct()
        
        return queryset


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        gender = self.request.query_params.get('gender', None)
        is_featured = self.request.query_params.get('is_featured', None)
        
        if category:
            queryset = queryset.filter(category_id=category)
        if gender:
            queryset = queryset.filter(gender=gender)
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        on_sale_products = self.queryset.exclude(discount_price__isnull=True)
        serializer = self.get_serializer(on_sale_products, many=True)
        return Response(serializer.data)

