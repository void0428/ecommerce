from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Order, OrderItem, Cart, CartItem
from .serializers import OrderSerializer, CartSerializer, CartItemSerializer
from notifications.utils import send_order_receipt, send_cart_reminder
from products.models import Product


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status == 'P':
            order.status = 'C'
            order.save()
            return Response({'status': 'Order cancelled'})
        return Response(
            {'error': 'Only pending orders can be cancelled'},
            status=status.HTTP_400_BAD_REQUEST
        )


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return Cart.objects.filter(user=self.request.user)

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def list(self, request, *args, **kwargs):
        """Override list to return single cart object instead of array"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to add request context"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        size = request.data.get('size', 'M')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            size=size,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        # If cart reaches 3 items, send a friendly reminder email (only once when hitting 3)
        try:
            total_items = cart.items.count()
            if total_items == 3:
                send_cart_reminder(cart)
        except Exception:
            # Log/ignore to avoid breaking API
            pass

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            if quantity <= 0:
                cart_item.delete()
            else:
                cart_item.quantity = quantity
                cart_item.save()
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Block checkout if email not verified
        try:
            if not request.user.profile.email_verified:
                return Response({'error': 'Please verify your email before placing an order'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            # If profile missing or other error, be conservative and block
            return Response({'error': 'Please verify your email before placing an order'}, status=status.HTTP_403_FORBIDDEN)

        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        shipping_address = request.data.get('shipping_address')
        phone_number = request.data.get('phone_number')

        if not shipping_address or not phone_number:
            return Response(
                {'error': 'Shipping address and phone number are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_address,
            phone_number=phone_number
        )

        total = 0
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                size=cart_item.size,
                price=cart_item.product.final_price
            )
            total += cart_item.subtotal

        order.total_amount = total
        order.save()

        # Send order receipt to verified email users
        try:
            send_order_receipt(order)
        except Exception:
            pass

        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

