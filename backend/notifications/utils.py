import threading
import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from users.models import ensure_user_profile

logger = logging.getLogger(__name__)


def _send_mail_thread(subject, message, from_email, recipient_list, html_message=None):
    try:
        send_mail(subject, message, from_email, recipient_list, html_message=html_message, fail_silently=False)
    except Exception as e:
        logger.exception('Failed to send email to %s: %s', recipient_list, e)


def send_template_email(to_email, subject, template_base, context):
    """
    Render a text (and optional HTML) template and send email asynchronously.
    `template_base` should be a path like 'emails/order_receipt' — the function will try
    to render both `.txt` and `.html` variants if available.
    """
    if not to_email:
        return

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', settings.EMAIL_HOST_USER)
    try:
        message = render_to_string(f"{template_base}.txt", context)
    except Exception:
        message = ''

    html_message = None
    try:
        # HTML is optional
        html_message = render_to_string(f"{template_base}.html", context)
    except Exception:
        html_message = None

    # Fire off in separate thread so HTTP request isn't blocked
    thread = threading.Thread(target=_send_mail_thread, args=(subject, message, from_email, [to_email], html_message))
    thread.daemon = True
    thread.start()


def send_order_receipt(order):
    """Send an order receipt email to the order.user when their email is verified."""
    user = getattr(order, 'user', None)
    if not user:
        return

    profile = ensure_user_profile(user)
    if not profile or not profile.email_verified:
        logger.info('Not sending order receipt: user %s email not verified', user)
        return

    context = {
        'user': user,
        'order': order,
        'items': order.items.all(),
    }
    subject = f"Your order receipt — Order #{order.id}"
    send_template_email(user.email, subject, 'emails/order_receipt', context)


def send_order_status_notification(order, new_status, notes=None):
    """Send status update email when order status changes."""
    user = getattr(order, 'user', None)
    if not user:
        return

    profile = ensure_user_profile(user)
    if not profile or not profile.email_verified:
        logger.info('Not sending order status notification: user %s email not verified', user)
        return

    # Map status codes to template names and email subjects
    status_map = {
        'P': ('order_pending', 'Your order has been received'),
        'PR': ('order_processing', 'Your order is being processed'),
        'S': ('order_shipped', 'Your order has been shipped'),
        'D': ('order_delivered', 'Your order has been delivered'),
        'C': ('order_cancelled', 'Your order has been cancelled'),
    }

    if new_status not in status_map:
        logger.warning('Unknown order status: %s', new_status)
        return

    template_name, subject_line = status_map[new_status]

    context = {
        'user': user,
        'order': order,
        'items': order.items.all(),
        'status': dict(order.STATUS_CHOICES).get(new_status),
        'notes': notes,
    }
    subject = f"{subject_line} — Order #{order.id}"
    send_template_email(user.email, subject, f'emails/{template_name}', context)


def send_cart_reminder(cart):
    """Send a cart reminder email to the cart.user when their email is verified."""
    user = getattr(cart, 'user', None)
    if not user:
        return

    profile = ensure_user_profile(user)
    if not profile or not profile.email_verified:
        logger.info('Not sending cart reminder: user %s email not verified', user)
        return

    items = cart.items.all()
    if not items:
        return

    context = {
        'user': user,
        'cart': cart,
        'items': items,
    }
    subject = 'You have items waiting in your cart'
    send_template_email(user.email, subject, 'emails/cart_reminder', context)
