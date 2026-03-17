import secrets
from datetime import timedelta
from urllib.parse import quote_plus

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from accounts.models import EmailVerificationToken


def generate_otp(length=6):
	"""Generate a numeric OTP code."""
	minimum = 10 ** (length - 1)
	maximum = (10 ** length) - 1
	return str(secrets.randbelow(maximum - minimum + 1) + minimum)


def create_email_token(user, token_type="email_verification"):
	"""Create a fresh OTP token and invalidate any previously unused token of same type."""
	EmailVerificationToken.objects.filter(
		user=user,
		token_type=token_type,
		is_used=False,
	).update(is_used=True)

	if token_type == 'password_reset':
		expiry_minutes = getattr(settings, "PASSWORD_RESET_OTP_EXPIRY_MINUTES", 10)
	else:
		expiry_minutes = getattr(settings, "EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES", 10)
	otp = generate_otp(6)

	return EmailVerificationToken.objects.create(
		user=user,
		token=otp,
		token_type=token_type,
		expires_at=timezone.now() + timedelta(minutes=expiry_minutes),
	)


def send_verification_email(user, token_obj):
	"""Send an email containing OTP code for account verification."""
	expiry_minutes = getattr(settings, "EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES", 10)
	subject = "Verify your email - Smart Coaching Center"
	message = (
		f"Hi {user.name},\n\n"
		"Your OTP code for email verification is:\n"
		f"{token_obj.token}\n\n"
		f"This OTP will expire in {expiry_minutes} minutes.\n"
		"If you did not request this, please ignore this email."
	)

	send_mail(
		subject=subject,
		message=message,
		from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
		recipient_list=[user.email],
		fail_silently=False,
	)


def send_password_setup_link_email(user):
	"""Send an email containing a password setup link without OTP."""
	base_url = getattr(settings, "PASSWORD_SETUP_URL", "http://127.0.0.1:8000/api/v1/users/password-setup-start/")
	setup_url = f"{base_url}?email={quote_plus(user.email)}"
	subject = "Set your password - Smart Coaching Center"
	message = (
		f"Hi {user.name},\n\n"
		"Your account has been created. Click this link to open the set password form:\n"
		f"{setup_url}\n\n"
		"From the form: first click Send OTP, then submit OTP and password to activate account.\n"
		"If you did not expect this, please contact your coaching center admin."
	)

	send_mail(
		subject=subject,
		message=message,
		from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
		recipient_list=[user.email],
		fail_silently=False,
	)


def send_password_setup_otp_email(user, token_obj):
	"""Send OTP email after user requests OTP from setup flow."""
	expiry_minutes = getattr(settings, "PASSWORD_RESET_OTP_EXPIRY_MINUTES", 10)
	subject = "Your password setup OTP - Smart Coaching Center"
	message = (
		f"Hi {user.name},\n\n"
		"Use this OTP to complete password setup:\n"
		f"{token_obj.token}\n\n"
		f"This OTP will expire in {expiry_minutes} minutes.\n"
		"If you did not request this, please ignore this email."
	)

	send_mail(
		subject=subject,
		message=message,
		from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
		recipient_list=[user.email],
		fail_silently=False,
	)


def send_password_reset_otp_email(user, token_obj):
	"""Send OTP email for forgot-password reset flow."""
	expiry_minutes = getattr(settings, "PASSWORD_RESET_OTP_EXPIRY_MINUTES", 10)
	subject = "Reset your password - Smart Coaching Center"
	message = (
		f"Hi {user.name},\n\n"
		"Use this OTP to reset your password:\n"
		f"{token_obj.token}\n\n"
		f"This OTP will expire in {expiry_minutes} minutes.\n"
		"If you did not request a password reset, please ignore this email."
	)

	send_mail(
		subject=subject,
		message=message,
		from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@example.com"),
		recipient_list=[user.email],
		fail_silently=False,
	)
