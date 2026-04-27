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

"""
Student-facing API views.

Endpoints (all prefixed /api/v1/academics/student/):
  GET  dashboard/                          – summary stats
  GET  centers/                            – browse approved coaching centers
  GET  centers/<id>/courses/               – courses of a center
  GET  courses/<id>/batches/               – active batches for a course
  POST batches/<id>/enroll/                – enroll in a batch
  GET  enrollments/                        – my enrollments
  GET  exams/                              – my exams (filterable by status)
  GET  results/                            – my published results
  GET  notifications/                      – my notifications
  POST notifications/<id>/read/            – mark one notification as read
  POST notifications/read-all/             – mark all notifications as read
"""

# from django.db.models import Count, Q, Avg
# from rest_framework import status as http_status
# from rest_framework.exceptions import NotFound, ValidationError
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.views import APIView, Response

# from academics.models import Batch, BatchStatus, Course, Enrollment, EnrollmentStatus
# from centers.models import CoachingCenter, CenterStatus
# from exams.models import Exam, ExamResult, ExamStatus
# from notifications.models import Notification, NotificationStatus


# # ─── helpers ──────────────────────────────────────────────────────────────────

# def ok(data, message="Success"):
#     return Response({"success": True, "message": message, "data": data})


# def paginate(qs, request, serializer_fn):
#     """Very simple offset-limit pagination."""
#     limit  = int(request.query_params.get("limit",  20))
#     offset = int(request.query_params.get("offset", 0))
#     total  = qs.count()
#     items  = list(qs[offset: offset + limit])
#     return {
#         "count":   total,
#         "results": serializer_fn(items),
#     }


# # ─── Serializer helpers (plain dicts – no DRF serializer overhead) ─────────────

# def serialize_center(c):
#     return {
#         "coaching_center_id": c.coaching_center_id,
#         "center_name":        c.center_name,
#         "location":           c.location,
#         "address":            c.address,
#         "contact_number":     c.contact_number,
#         "email":              c.email,
#         "website":            c.website,
#         "description":        c.description,
#         "access_type":        c.access_type,
#         "logo":               c.logo.url if c.logo else None,
#         "course_count":       getattr(c, "course_count", 0),
#     }


# def serialize_course(c):
#     return {
#         "course_id":          c.course_id,
#         "course_title":       c.course_title,
#         "description":        c.description,
#         "fee":                str(c.fee),
#         "duration":           c.duration,
#         "coaching_center_id": c.coaching_center_id,
#         "active_batch_count": getattr(c, "active_batch_count", 0),
#     }


# def serialize_batch(b):
#     return {
#         "batch_id":     b.batch_id,
#         "batch_name":   b.batch_name,
#         "batch_code":   b.batch_code,
#         "batch_type":   b.batch_type,
#         "class_shift":  b.class_shift,
#         "start_date":   str(b.start_date),
#         "end_date":     str(b.end_date),
#         "max_students": b.max_students,
#         "status":       b.status,
#         "enrolled_count": getattr(b, "enrolled_count_val", b.enrolled_count),
#         "is_full":      b.is_full,
#     }


# def serialize_enrollment(e):
#     return {
#         "enrollment_id":    e.enrollment_id,
#         "enrollment_status": e.enrollment_status,
#         "enrolled_at":      e.enrolled_at.isoformat(),
#         "batch": {
#             "batch_id":    e.batch.batch_id,
#             "batch_name":  e.batch.batch_name,
#             "batch_type":  e.batch.batch_type,
#             "class_shift": e.batch.class_shift,
#             "status":      e.batch.status,
#             "start_date":  str(e.batch.start_date),
#             "end_date":    str(e.batch.end_date),
#         },
#         "course": {
#             "course_id":    e.batch.course.course_id,
#             "course_title": e.batch.course.course_title,
#             "fee":          str(e.batch.course.fee),
#         },
#         "center": {
#             "coaching_center_id": e.batch.coaching_center.coaching_center_id,
#             "center_name":        e.batch.coaching_center.center_name,
#         },
#     }


# def serialize_exam(exam, student):
#     """Serialize an exam with the student's result if published."""
#     my_result = None
#     try:
#         r = ExamResult.objects.get(exam=exam, student=student, published_at__isnull=False)
#         my_result = {
#             "result_id":           r.result_id,
#             "total_marks_obtained": str(r.total_marks_obtained),
#             "total_marks":          str(r.total_marks),
#             "percentage":           str(r.percentage),
#             "grade":                r.grade,
#             "result_status":        r.result_status,
#             "published_at":         r.published_at.isoformat() if r.published_at else None,
#         }
#     except ExamResult.DoesNotExist:
#         pass

#     return {
#         "exam_id":          exam.exam_id,
#         "title":            exam.title,
#         "exam_type":        exam.exam_type,
#         "status":           exam.status,
#         "total_marks":      str(exam.total_marks),
#         "pass_marks":       str(exam.pass_marks),
#         "duration_minutes": exam.duration_minutes,
#         "start_time":       exam.start_time.isoformat()  if exam.start_time  else None,
#         "end_time":         exam.end_time.isoformat()    if exam.end_time    else None,
#         "access_code":      exam.access_code,
#         "subject_name":     exam.subject.subject_name    if exam.subject_id  else None,
#         "batch_name":       exam.batch.batch_name        if exam.batch_id    else None,
#         "host_teacher":     exam.host_teacher.name       if exam.host_teacher_id else None,
#         "my_result":        my_result,
#     }


# def serialize_result(r):
#     return {
#         "result_id":             r.result_id,
#         "total_marks_obtained":  str(r.total_marks_obtained),
#         "total_marks":           str(r.total_marks),
#         "percentage":            str(r.percentage),
#         "grade":                 r.grade,
#         "result_status":         r.result_status,
#         "published_at":          r.published_at.isoformat() if r.published_at else None,
#         "exam": {
#             "exam_id":    r.exam.exam_id,
#             "title":      r.exam.title,
#             "exam_type":  r.exam.exam_type,
#             "start_time": r.exam.start_time.isoformat() if r.exam.start_time else None,
#             "subject_name": r.exam.subject.subject_name if r.exam.subject_id else None,
#             "batch_name":   r.exam.batch.batch_name     if r.exam.batch_id   else None,
#             "center_name":  r.exam.batch.coaching_center.center_name if r.exam.batch_id else None,
#         },
#     }


# def serialize_notification(n):
#     return {
#         "notification_id": n.notification_id,
#         "title":           n.title,
#         "message":         n.message,
#         "type":            n.type,
#         "status":          n.status,
#         "created_at":      n.created_at.isoformat(),
#         "sender_name":     n.sender.name if n.sender_id else None,
#     }


# # ─── Views ─────────────────────────────────────────────────────────────────────

# class StudentDashboardView(APIView):
#     """GET /academics/student/dashboard/"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         student = request.user

#         enrolled_courses = Enrollment.objects.filter(
#             student=student, enrollment_status=EnrollmentStatus.ACTIVE
#         ).count()

#         upcoming_exams = Exam.objects.filter(
#             batch__enrollments__student=student,
#             batch__enrollments__enrollment_status=EnrollmentStatus.ACTIVE,
#             status=ExamStatus.SCHEDULED,
#         ).distinct().count()

#         ongoing_exams = Exam.objects.filter(
#             batch__enrollments__student=student,
#             batch__enrollments__enrollment_status=EnrollmentStatus.ACTIVE,
#             status=ExamStatus.ONGOING,
#         ).distinct().count()

#         published_results = ExamResult.objects.filter(
#             student=student, published_at__isnull=False
#         )
#         average_score = 0
#         if published_results.exists():
#             avg = published_results.aggregate(avg=Avg("percentage"))["avg"]
#             average_score = round(float(avg or 0), 1)

#         unread_notifications = Notification.objects.filter(
#             user=student, status=NotificationStatus.UNREAD
#         ).count()

#         return ok({
#             "enrolled_courses":     enrolled_courses,
#             "upcoming_exams":       upcoming_exams,
#             "ongoing_exams":        ongoing_exams,
#             "average_score":        average_score,
#             "unread_notifications": unread_notifications,
#         })


# class StudentCenterListView(APIView):
#     """GET /academics/student/centers/?search="""
#     permission_classes = [AllowAny]

#     def get(self, request):
#         qs = CoachingCenter.objects.filter(status=CenterStatus.APPROVED)

#         search = request.query_params.get("search", "").strip()
#         if search:
#             qs = qs.filter(
#                 Q(center_name__icontains=search) | Q(location__icontains=search)
#             )

#         # Annotate with course_count
#         qs = qs.annotate(course_count=Count("courses", filter=Q(courses__is_archived=False)))

#         return ok(paginate(qs.order_by("center_name"), request, lambda items: [serialize_center(c) for c in items]))


# class StudentCenterCoursesView(APIView):
#     """GET /academics/student/centers/<center_id>/courses/"""
#     permission_classes = [AllowAny]

#     def get(self, request, center_id):
#         try:
#             center = CoachingCenter.objects.get(coaching_center_id=center_id, status=CenterStatus.APPROVED)
#         except CoachingCenter.DoesNotExist:
#             raise NotFound("Center not found.")

#         qs = Course.objects.filter(coaching_center=center, is_archived=False).annotate(
#             active_batch_count=Count(
#                 "batches",
#                 filter=Q(batches__status__in=[BatchStatus.RUNNING, BatchStatus.UPCOMING])
#             )
#         )
#         return ok(paginate(qs.order_by("course_title"), request, lambda items: [serialize_course(c) for c in items]))


# class StudentCourseBatchesView(APIView):
#     """GET /academics/student/courses/<course_id>/batches/"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, course_id):
#         try:
#             course = Course.objects.get(course_id=course_id, is_archived=False)
#         except Course.DoesNotExist:
#             raise NotFound("Course not found.")

#         qs = Batch.objects.filter(
#             course=course,
#             status__in=[BatchStatus.RUNNING, BatchStatus.UPCOMING],
#         )
#         return ok(paginate(qs.order_by("start_date"), request, lambda items: [serialize_batch(b) for b in items]))


# class StudentEnrollView(APIView):
#     """POST /academics/student/batches/<batch_id>/enroll/"""
#     permission_classes = [IsAuthenticated]

#     def post(self, request, batch_id):
#         try:
#             batch = Batch.objects.select_related("course", "coaching_center").get(pk=batch_id)
#         except Batch.DoesNotExist:
#             raise NotFound("Batch not found.")

#         if Enrollment.objects.filter(batch=batch, student=request.user).exists():
#             raise ValidationError("You are already enrolled in this batch.")

#         if batch.is_full:
#             raise ValidationError(
#                 f'Batch "{batch.batch_name}" has reached its maximum capacity of {batch.max_students} students.'
#             )

#         enrollment = Enrollment.objects.create(
#             batch=batch,
#             student=request.user,
#             enrollment_status=EnrollmentStatus.ACTIVE,
#         )
#         return ok(
#             {
#                 "enrollment_id":   enrollment.enrollment_id,
#                 "batch_name":      batch.batch_name,
#                 "course_title":    batch.course.course_title,
#                 "center_name":     batch.coaching_center.center_name,
#                 "enrolled_at":     enrollment.enrolled_at.isoformat(),
#             },
#             message="Enrolled successfully!",
#         )


# class StudentEnrollmentListView(APIView):
#     """GET /academics/student/enrollments/"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         qs = (
#             Enrollment.objects
#             .filter(student=request.user)
#             .select_related("batch", "batch__course", "batch__coaching_center")
#             .order_by("-enrolled_at")
#         )

#         status_filter = request.query_params.get("status")
#         if status_filter:
#             qs = qs.filter(enrollment_status=status_filter)

#         return ok(paginate(qs, request, lambda items: [serialize_enrollment(e) for e in items]))


# class StudentExamListView(APIView):
#     """GET /academics/student/exams/?status="""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         student = request.user

#         # Only exams for batches the student is actively enrolled in
#         enrolled_batches = Enrollment.objects.filter(
#             student=student, enrollment_status=EnrollmentStatus.ACTIVE
#         ).values_list("batch_id", flat=True)

#         qs = (
#             Exam.objects
#             .filter(batch_id__in=enrolled_batches)
#             .select_related("subject", "batch", "batch__coaching_center", "host_teacher")
#             .order_by("-start_time")
#         )

#         status_filter = request.query_params.get("status")
#         if status_filter:
#             qs = qs.filter(status=status_filter)

#         items = list(qs)
#         return ok({
#             "count":   len(items),
#             "results": [serialize_exam(ex, student) for ex in items],
#         })


# class StudentResultListView(APIView):
#     """GET /academics/student/results/"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         qs = (
#             ExamResult.objects
#             .filter(student=request.user, published_at__isnull=False)
#             .select_related("exam", "exam__subject", "exam__batch", "exam__batch__coaching_center")
#             .order_by("-published_at")
#         )
#         items = list(qs)
#         return ok({
#             "count":   len(items),
#             "results": [serialize_result(r) for r in items],
#         })


# class StudentNotificationListView(APIView):
#     """GET /academics/student/notifications/?type="""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         qs = Notification.objects.filter(user=request.user).select_related("sender")

#         type_filter = request.query_params.get("type")
#         if type_filter and type_filter != "all":
#             qs = qs.filter(type=type_filter)

#         unread_count = Notification.objects.filter(
#             user=request.user, status=NotificationStatus.UNREAD
#         ).count()

#         items = list(qs[:50])
#         return ok({
#             "count":        len(items),
#             "unread_count": unread_count,
#             "results":      [serialize_notification(n) for n in items],
#         })


# class StudentNotificationReadView(APIView):
#     """POST /academics/student/notifications/<notification_id>/read/"""
#     permission_classes = [IsAuthenticated]

#     def post(self, request, notification_id):
#         try:
#             n = Notification.objects.get(notification_id=notification_id, user=request.user)
#         except Notification.DoesNotExist:
#             raise NotFound("Notification not found.")
#         n.status = NotificationStatus.READ
#         n.save(update_fields=["status"])
#         return ok({"notification_id": notification_id}, message="Marked as read.")


# class StudentNotificationReadAllView(APIView):
#     """POST /academics/student/notifications/read-all/"""
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         count = Notification.objects.filter(
#             user=request.user, status=NotificationStatus.UNREAD
#         ).update(status=NotificationStatus.READ)
#         return ok({"marked_count": count}, message=f"{count} notification(s) marked as read.")