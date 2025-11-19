from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Profile for {self.user.username}"


def ensure_user_profile(user):
    """
    Convenience helper to guarantee a profile exists for the given user.
    Returns the profile instance or None if user is invalid.
    """
    if not user or not isinstance(user, User):
        return None
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


class EmailOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField()
    otp = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() >= self.expires_at

    def mark_used(self):
        self.is_used = True
        self.save()

    @classmethod
    def create_otp_for_user(cls, user, otp, ttl_minutes=10):
        expires = timezone.now() + timedelta(minutes=ttl_minutes)
        return cls.objects.create(user=user, email=user.email, otp=otp, expires_at=expires)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
