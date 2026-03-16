from django.urls import path
from accounts.views import (
    RegisterView,
    VerifyEmailOTPView,
    LoginView,
    RoleBasedUserCreateView,
    RequestPasswordSetupOTPView,
    SetPasswordWithOTPView,
    PasswordSetupStartView,
)

urlpatterns = [
    path("users/password-setup-start/", PasswordSetupStartView.as_view(), name="password-setup-start"),
    path("register/", RegisterView.as_view(), name="register"),
    path("register/verify-otp/", VerifyEmailOTPView.as_view(), name="verify-register-otp"),
    path("login/", LoginView.as_view(), name="role-based-login"),
    path("users/create/", RoleBasedUserCreateView.as_view(), name="role-based-user-create"),
    path("users/request-password-otp/", RequestPasswordSetupOTPView.as_view(), name="request-password-otp"),
    path("users/set-password/", SetPasswordWithOTPView.as_view(), name="set-password-with-otp"),
]
