from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from accounts.managers import UserManager

# Create your models name:Role, User, UserProfile

class RoleName(models.TextChoices):
    SUPER_ADMIN = 'super_admin', 'Super Admin'
    SUPER_ADMIN_STAFF = 'super_admin_staff', 'Super Admin Staff'
    COACHING_ADMIN = 'coaching_admin', 'Coaching Admin'
    COACHING_MANAGER = 'coaching_manager', 'Coaching Manager'
    COACHING_STAFF = 'coaching_staff', 'Coaching Staff'
    TEACHER = 'teacher', 'Teacher'
    STUDENT = 'student', 'Student'
    LLM = 'llm', 'LLM System'


class Role(models.Model):
    role_id = models.BigAutoField(primary_key=True)
    role_name = models.CharField(max_length=30, choices=RoleName.choices, unique=True)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.role_name

class GenderChoice(models.TextChoices):
    MALE = 'male', 'Male'
    FEMALE = 'female', 'Female'
    OTHER = 'other', 'Other'

class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GenderChoice.choices, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    profile_image = models.CharField(max_length=500, blank=True)  # File path/URL
    bio = models.TextField(blank=True)

    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='users',
        db_column='role_id'
    )

    # Email verification
    email_verified = models.BooleanField(default=False)

    # Django required fields
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)  # Django admin access

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Password field is inherited from AbstractBaseUser as 'password'

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.name} <{self.email}>'

    @property
    def role_name(self):
        return self.role.role_name if self.role else None


class EmploymentStatus(models.TextChoices):
    FULL_TIME = 'full_time', 'Full Time'
    PART_TIME = 'part_time', 'Part Time'


class UserProfile(models.Model):
    """Unified profile for all roles. Role-specific fields are NULL for irrelevant roles."""

    profile_id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', db_column='user_id')
    # coaching_center = models.ForeignKey(
    #     'coaching.CoachingCenter',
    #     on_delete=models.SET_NULL,
    #     null=True, blank=True,
    #     db_column='coaching_center_id'
    # )

    # ── Student fields ─────────────────────────────────────────────────────────
    class_name = models.CharField(max_length=50, blank=True, db_column='class')   # e.g. Class 11
    group_name = models.CharField(max_length=50, blank=True)    # Science, Commerce
    roll_number = models.CharField(max_length=50, blank=True)
    guardian_name = models.CharField(max_length=255, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)

    # ── Teacher / Staff fields ─────────────────────────────────────────────────
    subject_specialization = models.CharField(max_length=255, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        blank=True
    )

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f'Profile of {self.user.name}'


class EmailVerificationToken(models.Model):
    """Tokens for email verification and password reset."""

    TOKEN_TYPE_CHOICES = [
        ('email_verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_tokens')
    token = models.CharField(max_length=255, unique=True)
    token_type = models.CharField(max_length=30, choices=TOKEN_TYPE_CHOICES)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'email_verification_tokens'

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f'{self.token_type} token for {self.user.email}'