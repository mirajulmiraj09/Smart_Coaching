from rest_framework import serializers
import secrets
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User, Role, UserProfile, RoleName, EmailVerificationToken


class UserProfileSerializer(serializers.ModelSerializer):
    STUDENT_FIELDS = {
        'class_name',
        'group_name',
        'roll_number',
        'guardian_name',
        'guardian_phone',
    }
    STAFF_FIELDS = {
        'subject_specialization',
        'salary',
        'joining_date',
        'experience_years',
        'employment_status',
    }

    ROLE_FIELD_MAP = {
        RoleName.STUDENT: STUDENT_FIELDS,
        RoleName.TEACHER: STAFF_FIELDS,
        RoleName.COACHING_STAFF: STAFF_FIELDS,
        RoleName.COACHING_MANAGER: STAFF_FIELDS,
        RoleName.COACHING_ADMIN: STAFF_FIELDS,
    }

    class Meta:
        model = UserProfile
        fields = [
            'profile_id',
            'user',
            'class_name',
            'group_name',
            'roll_number',
            'guardian_name',
            'guardian_phone',
            'subject_specialization',
            'salary',
            'joining_date',
            'experience_years',
            'employment_status',
        ]
        read_only_fields = ['profile_id', 'user']

    @classmethod
    def allowed_fields_for_role(cls, role_name):
        return cls.ROLE_FIELD_MAP.get(role_name, set())

    @classmethod
    def normalize_profile_data(cls, profile_data, role_name):
        allowed = cls.allowed_fields_for_role(role_name)
        return {field: value for field, value in profile_data.items() if field in allowed}

    def validate(self, attrs):
        role_name = self.context.get('role_name')
        if not role_name:
            return attrs
        return self.normalize_profile_data(attrs, role_name)

class RegisterSerializer(serializers.Serializer):
    CREATION_RULES = {
        RoleName.COACHING_ADMIN: {RoleName.COACHING_ADMIN, RoleName.COACHING_STAFF},
        RoleName.COACHING_STAFF: {RoleName.TEACHER, RoleName.COACHING_MANAGER},
        RoleName.COACHING_MANAGER: {RoleName.STUDENT},
        RoleName.TEACHER: {RoleName.STUDENT},
    }

    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=RoleName.choices, required=False, default=RoleName.STUDENT)
    profile = serializers.DictField(required=False, default=dict)
    password = serializers.CharField(min_length=8, write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
        creator = self.context.get('creator')
        target_role = attrs.get('role', RoleName.STUDENT)

        password = attrs.get('password') or ''
        confirm_password = attrs.get('confirm_password') or ''
        if creator:
            attrs.pop('password', None)
            attrs.pop('confirm_password', None)
        else:
            if not password or not confirm_password:
                raise serializers.ValidationError({'password': 'Password and confirm_password are required.'})
            if password != confirm_password:
                raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
            validate_password(password)
        if creator and not creator.is_superuser:
            allowed_target_roles = self.CREATION_RULES.get(creator.role_name, set())
            if target_role not in allowed_target_roles:
                raise serializers.ValidationError(
                    {'role': 'You are not allowed to create this role.'}
                )

        profile_serializer = UserProfileSerializer(
            data=attrs.get('profile', {}),
            context={'role_name': target_role},
        )
        profile_serializer.is_valid(raise_exception=True)
        attrs['profile'] = profile_serializer.validated_data

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        provided_password = validated_data.pop('password', None)
        phone = validated_data.pop('phone', None)
        role_name = validated_data.pop('role', RoleName.STUDENT)
        profile_data = validated_data.pop('profile', {})
        creator = self.context.get('creator')

        is_internal_creation = bool(creator)

        role, _ = Role.objects.get_or_create(
            role_name=role_name,
            defaults={'description': role_name.replace('_', ' ').title()}
        )

        user = User.objects.create_user(
            email=validated_data['email'],
            password=provided_password or secrets.token_urlsafe(16),
            name=validated_data['name'],
            phone=phone or None,
            role=role,
            email_verified=False,
            is_active=False,
        )

        normalized_profile_data = UserProfileSerializer.normalize_profile_data(profile_data, role_name)
        UserProfile.objects.create(user=user, **normalized_profile_data)

        return user


class VerifyEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        email = attrs['email'].lower()
        otp = attrs['otp']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({'email': 'No account found with this email.'}) from exc

        if user.email_verified:
            raise serializers.ValidationError({'email': 'Email is already verified.'})

        token_obj = user.email_tokens.filter(
            token_type='email_verification',
            token=otp,
            is_used=False,
        ).order_by('-created_at').first()

        if not token_obj:
            raise serializers.ValidationError({'otp': 'Invalid OTP code.'})

        if token_obj.expires_at <= timezone.now():
            raise serializers.ValidationError({'otp': 'OTP has expired. Please request a new one.'})

        attrs['user'] = user
        attrs['token_obj'] = token_obj
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        token_obj = self.validated_data['token_obj']

        token_obj.is_used = True
        token_obj.save(update_fields=['is_used'])

        user.email_verified = True
        user.is_active = True
        user.save(update_fields=['email_verified', 'is_active'])

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].lower()
        password = attrs['password']
    
        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError({'detail': 'Invalid email or password.'})

        if not user.is_active:
            raise serializers.ValidationError({'detail': 'Account is inactive. Verify your email first.'})

        if not user.email_verified:
            raise serializers.ValidationError({'detail': 'Email is not verified.'})

        refresh = RefreshToken.for_user(user)
        attrs['user'] = user
        attrs['tokens'] = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        return attrs


class SetPasswordWithOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].lower()
        otp = attrs['otp']
        password = attrs['password']
        confirm_password = attrs['confirm_password']

        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        validate_password(password)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({'email': 'No account found with this email.'}) from exc

        token_obj = EmailVerificationToken.objects.filter(
            user=user,
            token_type='password_reset',
            token=otp,
            is_used=False,
        ).order_by('-created_at').first()

        if not token_obj:
            raise serializers.ValidationError({'otp': 'Invalid OTP code.'})

        if token_obj.expires_at <= timezone.now():
            raise serializers.ValidationError({'otp': 'OTP has expired. Please request a new one.'})

        attrs['user'] = user
        attrs['token_obj'] = token_obj
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        token_obj = self.validated_data['token_obj']
        password = self.validated_data['password']

        token_obj.is_used = True
        token_obj.save(update_fields=['is_used'])

        user.set_password(password)
        user.email_verified = True
        user.is_active = True
        user.save(update_fields=['password', 'email_verified', 'is_active', 'updated_at'])
        return user


class RequestPasswordSetupOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs['email'].lower()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({'email': 'No account found with this email.'}) from exc

        attrs['user'] = user
        attrs['email'] = email
        return attrs
        