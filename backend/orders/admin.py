from django.contrib import admin
from .models import Order, OrderItem, Cart, CartItem, OrderStatusUpdate


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderStatusUpdateInline(admin.TabularInline):
    model = OrderStatusUpdate
    extra = 0
    readonly_fields = ['old_status', 'new_status', 'updated_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'id']
    inlines = [OrderStatusUpdateInline, OrderItemInline]
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at']


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_items', 'total_amount', 'created_at']
    inlines = [CartItemInline]


@admin.register(OrderStatusUpdate)
class OrderStatusUpdateAdmin(admin.ModelAdmin):
    list_display = ['order', 'old_status', 'new_status', 'updated_at']
    list_filter = ['new_status', 'updated_at']
    search_fields = ['order__id', 'order__user__username']
    readonly_fields = ['order', 'old_status', 'new_status', 'updated_at']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

