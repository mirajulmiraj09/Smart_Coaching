import secrets
from datetime import timedelta

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
