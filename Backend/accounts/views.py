from rest_framework.views import APIView, Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from accounts.serializers import RegisterSerializer, VerifyEmailOTPSerializer, UserProfileSerializer, LoginSerializer
from accounts.utils import create_email_token, send_verification_email

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