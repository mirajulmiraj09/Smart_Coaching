from rest_framework.views import APIView, Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.views.generic import TemplateView
from accounts.serializers import (
    RegisterSerializer,
    VerifyEmailOTPSerializer,
    UserProfileSerializer,
    LoginSerializer,
    SetPasswordWithOTPSerializer,
    RequestPasswordSetupOTPSerializer,
)
from accounts.utils import (
    create_email_token,
    send_verification_email,
    send_password_setup_link_email,
    send_password_setup_otp_email,
)

def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    return Response({
        'success': True,
        'message': message,
        'data': data or {},
    }, status=status_code)

# Create your views here.
class RegisterView(CreateAPIView):
    """POST /api/v1/auth/register"""
    permission_classes = [AllowAny]
    throttle_scope = 'auth'
    
    def get_serializer_class(self):
        return RegisterSerializer

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        token_obj = create_email_token(user, 'email_verification')
        send_verification_email(user, token_obj)

        return success_response(
            data={
                'user_id': user.user_id,
                'email': user.email,
                'role': user.role_name,
                'email_verified': False,
                'profile': UserProfileSerializer(user.profile).data,
            },
            message='Registration successful. Please check your email to verify your account.',
            status_code=status.HTTP_201_CREATED,
        )


class VerifyEmailOTPView(CreateAPIView):
    """POST /api/v1/auth/register/verify-otp"""
    permission_classes = [AllowAny]
    serializer_class = VerifyEmailOTPSerializer

    def post(self, request):
        serializer = VerifyEmailOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return success_response(
            data={
                'user_id': user.user_id,
                'email': user.email,
                'email_verified': user.email_verified,
            },
            message='Email verified successfully. Your account is now active.',
            status_code=status.HTTP_200_OK,
        )


class LoginView(CreateAPIView):
    """POST /api/v1/auth/login"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        tokens = serializer.validated_data['tokens']

        return success_response(
            data={
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'role': user.role_name,
                'tokens': tokens,
                'profile': UserProfileSerializer(user.profile).data,
            },
            message='Login successful.',
            status_code=status.HTTP_200_OK,
        )


class RoleBasedUserCreateView(CreateAPIView):
    """POST /api/v1/auth/users/create"""

    permission_classes = [IsAuthenticated]
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'creator': request.user})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_password_setup_link_email(user)

        return success_response(
            data={
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'role': user.role_name,
                'email_verified': user.email_verified,
                'is_active': user.is_active,
                'profile': UserProfileSerializer(user.profile).data,
            },
            message='User created successfully. Password setup link sent to user email.',
            status_code=status.HTTP_201_CREATED,
        )


class PasswordSetupStartView(TemplateView):
    """GET /api/v1/auth/users/password-setup-start/?email=..."""

    template_name = 'accounts/set_password.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['prefilled_email'] = (self.request.GET.get('email') or '').strip().lower()
        return context


class RequestPasswordSetupOTPView(CreateAPIView):
    """POST /api/v1/auth/users/request-password-otp"""

    permission_classes = [AllowAny]
    serializer_class = RequestPasswordSetupOTPSerializer

    def post(self, request):
        serializer = RequestPasswordSetupOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token_obj = create_email_token(user, 'password_reset')
        send_password_setup_otp_email(user, token_obj)

        return success_response(
            data={
                'email': user.email,
            },
            message='OTP sent to email for password setup.',
            status_code=status.HTTP_200_OK,
        )


class SetPasswordWithOTPView(CreateAPIView):
    """POST /api/v1/auth/users/set-password"""

    permission_classes = [AllowAny]
    serializer_class = SetPasswordWithOTPSerializer

    def post(self, request):
        serializer = SetPasswordWithOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return success_response(
            data={
                'user_id': user.user_id,
                'email': user.email,
                'is_active': user.is_active,
            },
            message='Password set successfully. You can now login.',
            status_code=status.HTTP_200_OK,
        )