from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.cache import cache
from .models import Order, OrderStatusUpdate
from notifications.utils import send_order_status_notification
import logging

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Order)
def track_order_status_change(sender, instance, **kwargs):
    """Track the old status before saving"""
    try:
        old_order = Order.objects.get(pk=instance.pk)
        # Store old status in cache for use in post_save
        cache.set(f'order_{instance.pk}_old_status', old_order.status, timeout=60)
    except Order.DoesNotExist:
        # New order, no old status
        pass


@receiver(post_save, sender=Order)
def send_status_notification(sender, instance, created, **kwargs):
    """Send email notification when order status changes"""
    if created:
        # Don't send notification for newly created orders (receipt already sent)
        return

    # Get the old status from cache
    old_status = cache.get(f'order_{instance.pk}_old_status')

    # Check if status has actually changed
    if old_status and old_status != instance.status:
        logger.info(f'Order {instance.pk} status changed from {old_status} to {instance.status}')

        # Create OrderStatusUpdate record
        try:
            OrderStatusUpdate.objects.create(
                order=instance,
                old_status=old_status,
                new_status=instance.status,
            )
        except Exception as e:
            logger.exception(f'Failed to create OrderStatusUpdate: {e}')

        # Send notification email
        try:
            send_order_status_notification(instance, instance.status)
        except Exception as e:
            logger.exception(f'Failed to send order status notification: {e}')

        # Clear cache
        cache.delete(f'order_{instance.pk}_old_status')
