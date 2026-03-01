from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from accounts.models import User, Role, UserProfile,RoleName

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('This phone number is already registered.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        phone = validated_data.pop('phone', None)

        # Default role = student
        student_role, _ = Role.objects.get_or_create(
            role_name=RoleName.STUDENT,
            defaults={'description': 'Student user'}
        )

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            phone=phone or None,
            role=student_role,
            email_verified=False,
            is_active=True,
        )
        # Create empty profile
        UserProfile.objects.create(user=user)
        return user

