from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import EmailVerificationToken, User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class RegistrationOTPFlowTests(TestCase):
	def setUp(self):
		self.client = APIClient()

	def test_register_creates_inactive_user_and_sends_otp(self):
		payload = {
			'name': 'Test Student',
			'email': 'student@example.com',
			'password': 'Str0ngPass!123',
			'confirm_password': 'Str0ngPass!123',
		}

		response = self.client.post('/api/v1/register/', payload, format='json')

		self.assertEqual(response.status_code, 201)
		user = User.objects.get(email='student@example.com')
		self.assertFalse(user.is_active)
		self.assertFalse(user.email_verified)

		token = EmailVerificationToken.objects.filter(
			user=user,
			token_type='email_verification',
			is_used=False,
		).first()
		self.assertIsNotNone(token)
		self.assertEqual(len(mail.outbox), 1)

	def test_verify_otp_activates_user(self):
		register_payload = {
			'name': 'Test Student',
			'email': 'verifyme@example.com',
			'password': 'Str0ngPass!123',
			'confirm_password': 'Str0ngPass!123',
		}

		register_response = self.client.post('/api/v1/register/', register_payload, format='json')
		self.assertEqual(register_response.status_code, 201)

		user = User.objects.get(email='verifyme@example.com')
		token = user.email_tokens.filter(
			token_type='email_verification',
			is_used=False,
		).order_by('-created_at').first()

		verify_response = self.client.post(
			'/api/v1/register/verify-otp/',
			{'email': user.email, 'otp': token.token},
			format='json',
		)

		self.assertEqual(verify_response.status_code, 200)
		user.refresh_from_db()
		token.refresh_from_db()
		self.assertTrue(user.is_active)
		self.assertTrue(user.email_verified)
		self.assertTrue(token.is_used)
