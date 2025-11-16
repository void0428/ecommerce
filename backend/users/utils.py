import random
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def generate_otp(length=6):
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def send_otp_email(to_email, username, otp):
    subject = 'Your verification code'
    # Simple text body; you can replace with an HTML template if desired
    message = f"Hi {username},\n\nYour verification code is: {otp}\nIt will expire in 10 minutes.\n\nIf you didn't request this, please ignore.\n"
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, message, from_email, [to_email], fail_silently=False)
