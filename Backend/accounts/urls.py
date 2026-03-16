from django.urls import path
from accounts.views import RegisterView, VerifyEmailOTPView, LoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register/verify-otp/", VerifyEmailOTPView.as_view(), name="verify-register-otp"),
    path("login/", LoginView.as_view(), name="role-based-login"),
]
