from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import Role, User, UserProfile, EmailVerificationToken


# ─────────────────────────────────────────────
# Role Admin
# ─────────────────────────────────────────────
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_id', 'role_name', 'description', 'created_at')
    search_fields = ('role_name',)
    ordering = ('role_id',)


# ─────────────────────────────────────────────
# UserProfile Inline (Shown inside User Admin)
# ─────────────────────────────────────────────
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    extra = 0


# ─────────────────────────────────────────────
# Custom User Admin
# ─────────────────────────────────────────────
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

    list_display = (
        'user_id',
        'email',
        'name',
        'role',
        'email_verified',
        'is_active',
        'is_staff',
        'created_at'
    )

    list_filter = (
        'role',
        'email_verified',
        'is_active',
        'is_staff'
    )

    search_fields = ('email', 'name', 'phone')
    ordering = ('user_id',)

    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (_('Login Info'), {
            'fields': ('email', 'password')
        }),
        (_('Personal Info'), {
            'fields': (
                'name',
                'phone',
                'gender',
                'date_of_birth',
                'address',
                'profile_image',
                'bio',
                'role',
            )
        }),
        (_('Permissions'), {
            'fields': (
                'email_verified',
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
        (_('Important Dates'), {
            'fields': ('created_at', 'updated_at')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2','role','is_active'),
        }),
    )


# ─────────────────────────────────────────────
# UserProfile Admin (Optional Separate View)
# ─────────────────────────────────────────────
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('profile_id', 'user')
    search_fields = ('user__email', 'user__name')


# ─────────────────────────────────────────────
# Email Verification Token Admin
# ─────────────────────────────────────────────
@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'token_type',
        'is_used',
        'expires_at',
        'created_at'
    )
    list_filter = ('token_type', 'is_used')
    search_fields = ('user__email', 'token')
    ordering = ('-created_at',)