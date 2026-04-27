# academics/student_views.py
from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.db.models import Q

from accounts.models import RoleName
from academics.models import (
    Batch, Course, Enrollment,
)
from centers.models import CoachingCenter
from exams.models import Exam, ExamResult, ExamStatus


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    return Response({
        'success': True,
        'message': message,
        'data': data or {},
    }, status=status_code)


def ensure_student(user):
    from rest_framework.exceptions import PermissionDenied
    if user.role_name != RoleName.STUDENT:
        raise PermissionDenied('Only students can access this.')


# ── GET /academics/student/dashboard/ ────────────────────────────────────────
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_student(request.user)
        student = request.user

        enrollments = Enrollment.objects.filter(
            student=student, enrollment_status='active'
        ).select_related('batch__course', 'batch__coaching_center')

        total_enrolled = enrollments.count()

        # Upcoming exams
        upcoming_exams = Exam.objects.filter(
            batch__enrollments__student=student,
            batch__enrollments__enrollment_status='active',
            status__in=[ExamStatus.SCHEDULED, ExamStatus.ONGOING],
        ).distinct().count()

        # Completed exams
        results = ExamResult.objects.filter(student=student)
        completed_exams = results.count()
        avg_score = 0
        if completed_exams > 0:
            total_pct = sum(
                float(r.percentage) for r in results if r.percentage is not None
            )
            avg_score = round(total_pct / completed_exams, 1)

        # Recent enrollments
        recent = []
        for e in enrollments.order_by('-enrolled_at')[:5]:
            recent.append({
                'enrollment_id': e.enrollment_id,
                'course_title': e.batch.course.course_title,
                'batch_name': e.batch.batch_name,
                'center_name': e.batch.coaching_center.center_name if e.batch.coaching_center else '—',
                'enrolled_at': e.enrolled_at,
                'batch_status': e.batch.status,
            })

        return success_response(data={
            'total_enrolled': total_enrolled,
            'upcoming_exams': upcoming_exams,
            'completed_exams': completed_exams,
            'avg_score': avg_score,
            'recent_enrollments': recent,
        })


# ── GET /academics/student/enrollments/ ──────────────────────────────────────
class StudentEnrollmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_student(request.user)

        enrollments = Enrollment.objects.filter(
            student=request.user
        ).select_related('batch__course', 'batch__coaching_center').order_by('-enrolled_at')

        data = []
        for e in enrollments:
            b = e.batch
            data.append({
                'enrollment_id': e.enrollment_id,
                'status': e.enrollment_status,
                'enrolled_at': e.enrolled_at,
                'batch_id': b.batch_id,
                'batch_name': b.batch_name,
                'batch_type': b.batch_type,
                'batch_status': b.status,
                'shift': b.shift,
                'start_date': b.start_date,
                'end_date': b.end_date,
                'course_id': b.course.course_id,
                'course_title': b.course.course_title,
                'course_type': b.course.course_type,
                'center_name': b.coaching_center.center_name if b.coaching_center else '—',
            })

        return success_response(data={'enrollments': data})


# ── GET /academics/student/exams/ ────────────────────────────────────────────
class StudentExamsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_student(request.user)

        exams = Exam.objects.filter(
            batch__enrollments__student=request.user,
            batch__enrollments__enrollment_status='active',
        ).select_related('subject', 'batch', 'host_teacher').distinct().order_by('-created_at')

        data = []
        for e in exams:
            result = ExamResult.objects.filter(
                student=request.user, exam=e
            ).first()

            data.append({
                'exam_id': e.exam_id,
                'title': e.title,
                'exam_type': e.exam_type,
                'status': e.status,
                'subject_name': e.subject.subject_name if e.subject else '—',
                'batch_name': e.batch.batch_name,
                'total_marks': str(e.total_marks),
                'pass_marks': str(e.pass_marks),
                'duration_minutes': e.duration_minutes,
                'start_time': e.start_time,
                'end_time': e.end_time,
                'access_code': e.access_code if e.status == ExamStatus.ONGOING else None,
                'teacher_name': e.host_teacher.name if e.host_teacher else '—',
                'result': {
                    'obtained_marks': str(result.obtained_marks) if result else None,
                    'percentage': str(result.percentage) if result else None,
                    'is_passed': result.is_passed if result else None,
                    'grade': result.grade if result else None,
                } if result else None,
            })

        return success_response(data={'exams': data})


# ── GET /academics/student/results/ ──────────────────────────────────────────
class StudentResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_student(request.user)

        results = ExamResult.objects.filter(
            student=request.user
        ).select_related('exam__subject', 'exam__batch').order_by('-created_at')

        data = []
        for r in results:
            data.append({
                'result_id': r.result_id,
                'exam_title': r.exam.title,
                'subject_name': r.exam.subject.subject_name if r.exam.subject else '—',
                'batch_name': r.exam.batch.batch_name,
                'total_marks': str(r.exam.total_marks),
                'obtained_marks': str(r.obtained_marks),
                'percentage': str(r.percentage) if r.percentage else '0',
                'is_passed': r.is_passed,
                'grade': r.grade,
                'created_at': r.created_at,
            })

        return success_response(data={'results': data})


# ── GET /academics/student/notifications/ ────────────────────────────────────
class StudentNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_student(request.user)
        # If you have a Notification model, use it.
        # For now return empty — replace with your actual model.
        try:
            from notifications.models import Notification
            notifs = Notification.objects.filter(
                recipient=request.user
            ).order_by('-created_at')[:50]
            data = [
                {
                    'notification_id': n.id,
                    'title': n.title,
                    'message': n.message,
                    'is_read': n.is_read,
                    'created_at': n.created_at,
                }
                for n in notifs
            ]
            unread = notifs.filter(is_read=False).count()
        except Exception:
            data = []
            unread = 0

        return success_response(data={'notifications': data, 'unread_count': unread})


# ── POST /academics/student/notifications/<id>/read/ ─────────────────────────
class StudentMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        ensure_student(request.user)
        try:
            from notifications.models import Notification
            n = Notification.objects.get(id=notification_id, recipient=request.user)
            n.is_read = True
            n.save(update_fields=['is_read'])
        except Exception:
            pass
        return success_response(message='Marked as read.')


# ── POST /academics/student/notifications/read-all/ ──────────────────────────
class StudentMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ensure_student(request.user)
        try:
            from notifications.models import Notification
            Notification.objects.filter(
                recipient=request.user, is_read=False
            ).update(is_read=True)
        except Exception:
            pass
        return success_response(message='All marked as read.')


# ── GET /academics/student/centers/ ──────────────────────────────────────────
class StudentCenterListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        centers = CoachingCenter.objects.filter(status='approved').order_by('center_name')
        data = [
            {
                'coaching_center_id': c.coaching_center_id,
                'center_name': c.center_name,
                'location': c.location,
                'address': c.address,
                'contact_number': c.contact_number,
                'email': c.email,
                'website': c.website,
                'access_type': c.access_type,
                'description': c.description,
                'established_date': c.established_date,
            }
            for c in centers
        ]
        return success_response(data={'centers': data})


# ── GET /academics/student/centers/<center_id>/courses/ ──────────────────────
class StudentCenterCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, center_id):
        courses = Course.objects.filter(
            coaching_center_id=center_id,
            is_archived=False,
        ).order_by('course_title')

        data = [
            {
                'course_id': c.course_id,
                'course_title': c.course_title,
                'course_type': c.course_type,
                'description': c.description,
                'duration_months': c.duration_months,
                'fee': str(c.fee) if c.fee else None,
                'is_free': c.is_free,
                'batch_count': c.batches.filter(status__in=['upcoming', 'running']).count(),
            }
            for c in courses
        ]
        return success_response(data={'courses': data})


# ── GET /academics/student/courses/<course_id>/batches/ ──────────────────────
class StudentCourseBatchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        batches = Batch.objects.filter(
            course_id=course_id,
            status__in=['upcoming', 'running'],
        ).order_by('start_date')

        # Check which ones the student is already enrolled in
        enrolled_ids = set(
            Enrollment.objects.filter(
                student=request.user,
                batch__course_id=course_id,
            ).values_list('batch_id', flat=True)
        )

        data = [
            {
                'batch_id': b.batch_id,
                'batch_name': b.batch_name,
                'batch_type': b.batch_type,
                'shift': b.shift,
                'status': b.status,
                'start_date': b.start_date,
                'end_date': b.end_date,
                'max_students': b.max_students,
                'enrolled_count': b.enrolled_count,
                'available_seats': (b.max_students - b.enrolled_count) if b.max_students else None,
                'is_enrolled': b.batch_id in enrolled_ids,
            }
            for b in batches
        ]
        return success_response(data={'batches': data})


# ── POST /academics/student/batches/<batch_id>/enroll/ ───────────────────────
class StudentSelfEnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, batch_id):
        ensure_student(request.user)
        student = request.user

        # Already enrolled?
        if Enrollment.objects.filter(student=student, batch_id=batch_id).exists():
            return Response({
                'success': False,
                'message': 'You are already enrolled in this batch.',
            }, status=status.HTTP_400_BAD_REQUEST)

        batch = Batch.objects.filter(batch_id=batch_id, status__in=['upcoming', 'running']).first()
        if not batch:
            return Response({
                'success': False,
                'message': 'Batch not found or not available for enrollment.',
            }, status=status.HTTP_404_NOT_FOUND)

        # Seat check
        if batch.max_students and batch.enrolled_count >= batch.max_students:
            return Response({
                'success': False,
                'message': 'This batch is full. No seats available.',
            }, status=status.HTTP_400_BAD_REQUEST)

        enrollment = Enrollment.objects.create(
            student=student,
            batch=batch,
            enrollment_status='active',
            enrolled_at=timezone.now(),
        )

        # Update enrolled count
        batch.enrolled_count += 1
        batch.save(update_fields=['enrolled_count'])

        return success_response(
            data={'enrollment_id': enrollment.enrollment_id},
            message='Successfully enrolled in the batch!',
            status_code=status.HTTP_201_CREATED,
        )