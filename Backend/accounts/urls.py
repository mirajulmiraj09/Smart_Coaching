from django.urls import path
from accounts.views import (
    RegisterView,
    VerifyEmailOTPView,
    LoginView,
    RoleBasedUserCreateView,
    RequestPasswordSetupOTPView,
    SetPasswordWithOTPView,
    PasswordSetupStartView,
    MeProfileView,
    ChangePasswordView,
    RequestPasswordResetOTPView,
    ResetPasswordWithOTPView,
)

urlpatterns = [
    path("users/password-setup-start/", PasswordSetupStartView.as_view(), name="password-setup-start"),
    path("register/", RegisterView.as_view(), name="register"),
    path("register/verify-otp/", VerifyEmailOTPView.as_view(), name="verify-register-otp"),
    path("login/", LoginView.as_view(), name="role-based-login"),
    path("me/", MeProfileView.as_view(), name="me-profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("users/create/", RoleBasedUserCreateView.as_view(), name="role-based-user-create"),
    path("users/request-password-otp/", RequestPasswordSetupOTPView.as_view(), name="request-password-otp"),
    path("users/set-password/", SetPasswordWithOTPView.as_view(), name="set-password-with-otp"),
    path("password/reset/request-otp/", RequestPasswordResetOTPView.as_view(), name="password-reset-request-otp"),
    path("password/reset/confirm/", ResetPasswordWithOTPView.as_view(), name="password-reset-confirm"),
]
