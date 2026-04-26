from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import EmailVerificationToken, Role, RoleName, User, UserProfile
from notifications.models import Notification


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
		self.assertTrue(
			Notification.objects.filter(
				user=user,
				type='system',
				title__icontains='Verify your email',
			).exists()
		)

	def test_register_rejects_public_coaching_admin_role(self):
		payload = {
			'name': 'Prospective Admin',
			'email': 'admin.apply@example.com',
			'password': 'Str0ngPass!123',
			'confirm_password': 'Str0ngPass!123',
			'role': RoleName.COACHING_ADMIN,
		}

		response = self.client.post('/api/v1/register/', payload, format='json')

		self.assertEqual(response.status_code, 400)
		self.assertIn('role', response.data)
		self.assertEqual(User.objects.filter(email='admin.apply@example.com').count(), 0)

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


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AccountSelfServiceTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		student_role, _ = Role.objects.get_or_create(
			role_name=RoleName.STUDENT,
			defaults={'description': 'Student'},
		)
		self.user = User.objects.create_user(
			email='active.student@example.com',
			password='Str0ngPass!123',
			name='Active Student',
			role=student_role,
			email_verified=True,
			is_active=True,
		)
		UserProfile.objects.create(user=self.user, class_name='Class 11', group_name='Science')

	def _authenticate(self):
		response = self.client.post(
			'/api/v1/login/',
			{'email': self.user.email, 'password': 'Str0ngPass!123'},
			format='json',
		)
		self.assertEqual(response.status_code, 200)
		access = response.data['data']['tokens']['access']
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

	def test_me_returns_role_based_profile(self):
		self._authenticate()

		response = self.client.get('/api/v1/me/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['data']['email'], self.user.email)
		self.assertEqual(response.data['data']['role'], RoleName.STUDENT)
		self.assertIn('class_name', response.data['data']['profile'])
		self.assertNotIn('salary', response.data['data']['profile'])

	def test_me_patch_updates_allowed_profile_fields(self):
		self._authenticate()

		payload = {
			'name': 'Updated Student',
			'profile': {
				'class_name': 'Class 12',
				'salary': '1000.00',
			},
		}
		response = self.client.patch('/api/v1/me/', payload, format='json')

		self.assertEqual(response.status_code, 200)
		self.user.refresh_from_db()
		self.user.profile.refresh_from_db()
		self.assertEqual(self.user.name, 'Updated Student')
		self.assertEqual(self.user.profile.class_name, 'Class 12')
		self.assertIsNone(self.user.profile.salary)

	def test_change_password_updates_credentials(self):
		self._authenticate()

		response = self.client.post(
			'/api/v1/change-password/',
			{
				'current_password': 'Str0ngPass!123',
				'new_password': 'NewStr0ngPass!123',
				'confirm_new_password': 'NewStr0ngPass!123',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.user.refresh_from_db()
		self.assertTrue(self.user.check_password('NewStr0ngPass!123'))

	def test_reset_password_otp_flow(self):
		request_response = self.client.post(
			'/api/v1/password/reset/request-otp/',
			{'email': self.user.email},
			format='json',
		)
		self.assertEqual(request_response.status_code, 200)
		self.assertEqual(len(mail.outbox), 1)

		token = EmailVerificationToken.objects.filter(
			user=self.user,
			token_type='password_reset',
			is_used=False,
		).order_by('-created_at').first()
		self.assertIsNotNone(token)

		reset_response = self.client.post(
			'/api/v1/password/reset/confirm/',
			{
				'email': self.user.email,
				'otp': token.token,
				'new_password': 'ResetStr0ngPass!123',
				'confirm_new_password': 'ResetStr0ngPass!123',
			},
			format='json',
		)
		self.assertEqual(reset_response.status_code, 200)
		self.user.refresh_from_db()
		token.refresh_from_db()
		self.assertTrue(self.user.check_password('ResetStr0ngPass!123'))
		self.assertTrue(token.is_used)


class UserRoleStaffFlagTests(TestCase):
	def test_coaching_admin_is_not_system_staff(self):
		admin_role, _ = Role.objects.get_or_create(
			role_name=RoleName.COACHING_ADMIN,
			defaults={'description': 'Coaching Admin'},
		)

		user = User.objects.create_user(
			email='coaching.admin@example.com',
			password='Str0ngPass!123',
			name='Coaching Admin',
			role=admin_role,
			email_verified=True,
			is_active=True,
		)

		self.assertFalse(user.is_staff)
		self.assertTrue(user.isAdmin)
		self.assertFalse(user.isStaff)

	def test_coaching_staff_is_not_system_staff(self):
		staff_role, _ = Role.objects.get_or_create(
			role_name=RoleName.COACHING_STAFF,
			defaults={'description': 'Coaching Staff'},
		)

		user = User.objects.create_user(
			email='coaching.staff@example.com',
			password='Str0ngPass!123',
			name='Coaching Staff',
			role=staff_role,
			email_verified=True,
			is_active=True,
		)

		self.assertFalse(user.is_staff)
		self.assertTrue(user.isAdmin)
		self.assertFalse(user.isStaff)
