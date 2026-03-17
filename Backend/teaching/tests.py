from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import Role, RoleName, User
from academics.models import Batch, BatchType, ClassShift, Course
from centers.models import CenterMembership, CoachingCenter
from teaching.models import Subject, TeacherSubjectBatchAssignment


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class TeachingWorkflowTests(TestCase):
	def setUp(self):
		self.client = APIClient()

		self.admin_role, _ = Role.objects.get_or_create(role_name=RoleName.COACHING_ADMIN)
		self.manager_role, _ = Role.objects.get_or_create(role_name=RoleName.COACHING_MANAGER)
		self.teacher_role, _ = Role.objects.get_or_create(role_name=RoleName.TEACHER)
		self.student_role, _ = Role.objects.get_or_create(role_name=RoleName.STUDENT)

		self.admin_user = User.objects.create_user(
			email='workflow.admin@example.com',
			password='Str0ngPass!123',
			name='Workflow Admin',
			role=self.admin_role,
			is_active=True,
			email_verified=True,
		)
		self.manager_user = User.objects.create_user(
			email='workflow.manager@example.com',
			password='Str0ngPass!123',
			name='Workflow Manager',
			role=self.manager_role,
			is_active=True,
			email_verified=True,
		)
		self.teacher_user = User.objects.create_user(
			email='workflow.teacher@example.com',
			password='Str0ngPass!123',
			name='Workflow Teacher',
			role=self.teacher_role,
			is_active=True,
			email_verified=True,
		)
		self.student_user = User.objects.create_user(
			email='workflow.student@example.com',
			password='Str0ngPass!123',
			name='Workflow Student',
			role=self.student_role,
			is_active=True,
			email_verified=True,
		)

		self.center = CoachingCenter.objects.create(
			center_name='Alpha Coaching',
			location='Dhaka',
			contact_number='01700000000',
			created_by=self.admin_user,
			status='approved',
		)

		CenterMembership.objects.create(
			user=self.teacher_user,
			coaching_center=self.center,
			role=CenterMembership.Role.TEACHER,
		)

	def test_admin_can_create_course(self):
		self.client.force_authenticate(user=self.admin_user)

		payload = {
			'course_title': 'HSC Science',
			'description': 'Full prep',
			'fee': '5000.00',
			'duration': 16,
		}
		response = self.client.post(
			f'/api/v1/teaching/centers/{self.center.coaching_center_id}/courses/',
			payload,
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		self.assertTrue(Course.objects.filter(course_title='HSC Science').exists())

	def test_student_cannot_create_course(self):
		self.client.force_authenticate(user=self.student_user)

		payload = {
			'course_title': 'Blocked Course',
			'description': 'Not allowed',
			'fee': '3000.00',
			'duration': 8,
		}
		response = self.client.post(
			f'/api/v1/teaching/centers/{self.center.coaching_center_id}/courses/',
			payload,
			format='json',
		)

		self.assertEqual(response.status_code, 403)

	def test_manager_can_assign_teacher_and_email_is_sent(self):
		course = Course.objects.create(
			coaching_center=self.center,
			course_title='SSC Math',
			description='Core math',
			fee='4000.00',
			duration=12,
		)
		batch = Batch.objects.create(
			course=course,
			coaching_center=self.center,
			batch_name='SSC Morning 1',
			batch_code='SSC-M-1',
			batch_type=BatchType.REGULAR,
			class_shift=ClassShift.MORNING,
			start_date='2026-04-01',
			end_date='2026-07-01',
			max_students=60,
		)
		subject = Subject.objects.create(
			course=course,
			coaching_center=self.center,
			subject_name='Mathematics',
			subject_code='MATH-101',
		)

		self.client.force_authenticate(user=self.manager_user)
		payload = {
			'coaching_center': self.center.coaching_center_id,
			'course': course.course_id,
			'batch': batch.batch_id,
			'subject': subject.subject_id,
			'teacher': self.teacher_user.user_id,
		}
		response = self.client.post('/api/v1/teaching/assignments/teachers/', payload, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertTrue(
			TeacherSubjectBatchAssignment.objects.filter(
				batch=batch,
				subject=subject,
				teacher=self.teacher_user,
			).exists()
		)
		self.assertEqual(len(mail.outbox), 1)
		self.assertIn(self.teacher_user.email, mail.outbox[0].to)
