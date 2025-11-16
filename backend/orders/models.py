from django.db import models
from django.contrib.auth.models import User
from products.models import Product
from django.db.models.signals import pre_save
from django.dispatch import receiver


class Order(models.Model):
    STATUS_CHOICES = [
        ('P', 'Pending'),
        ('PR', 'Processing'),
        ('S', 'Shipped'),
        ('D', 'Delivered'),
        ('C', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default='P')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_address = models.TextField()
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

    def calculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save()
        return total


class OrderStatusUpdate(models.Model):
    """Track when order status changes"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_updates')
    old_status = models.CharField(max_length=2, choices=Order.STATUS_CHOICES)
    new_status = models.CharField(max_length=2, choices=Order.STATUS_CHOICES)
    updated_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Order {self.order.id}: {self.get_old_status_display()} → {self.get_new_status_display()}"

    def get_old_status_display(self):
        return dict(Order.STATUS_CHOICES).get(self.old_status, self.old_status)

    def get_new_status_display(self):
        return dict(Order.STATUS_CHOICES).get(self.new_status, self.new_status)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=10, default='M')
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ['order', 'product', 'size']

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Order {self.order.id}"

    @property
    def subtotal(self):
        return self.price * self.quantity


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_amount(self):
        return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=10, default='M')

    class Meta:
        unique_together = ['cart', 'product', 'size']

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Cart"

    @property
    def subtotal(self):
        return self.product.final_price * self.quantity

