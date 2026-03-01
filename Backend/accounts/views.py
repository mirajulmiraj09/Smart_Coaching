from django.shortcuts import render
from rest_framework.views import  Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from accounts.serializers import RegisterSerializer

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

        # Send verification email
        # token_obj = create_email_token(user, 'email_verification')
        # send_verification_email(user, token_obj)

        return success_response(
            data={
                'user_id': user.user_id,
                'email': user.email,
                'email_verified': False,
            },
            message='Registration successful. Please check your email to verify your account.',
            status_code=status.HTTP_201_CREATED,
        )