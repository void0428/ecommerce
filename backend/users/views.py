from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from .serializers import UserSerializer, UserRegistrationSerializer, LoginSerializer
from .models import UserProfile, EmailOTP
from .utils import generate_otp, send_otp_email


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Ensure a profile exists (signal should create it, but be defensive)
            profile, _ = UserProfile.objects.get_or_create(user=user)

            # Create OTP and send verification email
            otp = generate_otp()
            EmailOTP.create_otp_for_user(user, otp, ttl_minutes=10)
            try:
                send_otp_email(user.email, user.username, otp)
            except Exception:
                # If email fails, still create user but inform client
                return Response(
                    {'detail': 'User created but failed to send verification email. Please contact support.'},
                    status=status.HTTP_201_CREATED
                )

            return Response(
                {'detail': 'Verification email sent', 'email': user.email},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_email(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_obj = EmailOTP.objects.filter(email=email, is_used=False).order_by('-created_at').first()
            if not otp_obj:
                return Response({'error': 'No OTP found for this email'}, status=status.HTTP_400_BAD_REQUEST)

            if otp_obj.is_expired():
                return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

            if otp_obj.otp != otp:
                otp_obj.attempts += 1
                otp_obj.save()
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

            # Mark used and set profile verified
            otp_obj.mark_used()
            if otp_obj.user:
                profile, _ = UserProfile.objects.get_or_create(user=otp_obj.user)
                profile.email_verified = True
                profile.save()
            else:
                # If no user relation, try to find user by email
                try:
                    user = User.objects.get(email=email)
                    profile, _ = UserProfile.objects.get_or_create(user=user)
                    profile.email_verified = True
                    profile.save()
                except User.DoesNotExist:
                    pass

            return Response({'detail': 'Email verified successfully'})
        except Exception as e:
            return Response({'error': 'Verification failed', 'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def resend_otp(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Find most recent OTP
        latest = EmailOTP.objects.filter(email=email).order_by('-created_at').first()
        now = timezone.now()
        if latest and (now - latest.created_at).total_seconds() < 20:
            wait = 20 - int((now - latest.created_at).total_seconds())
            return Response({'error': f'Please wait {wait} seconds before resending'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Create new OTP and send
        try:
            user = None
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = None
            otp = generate_otp()
            if user:
                EmailOTP.create_otp_for_user(user, otp, ttl_minutes=10)
            else:
                expires = timezone.now() + timedelta(minutes=10)
                EmailOTP.objects.create(user=None, email=email, otp=otp, expires_at=expires)

            send_otp_email(email, user.username if user else email, otp)
            return Response({'detail': 'OTP resent'})
        except Exception as e:
            return Response({'error': 'Failed to resend OTP', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})

