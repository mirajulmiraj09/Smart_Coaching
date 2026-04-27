# # centers/coaching_admin_views.py  (নতুন ফাইল)
# """
# Coaching Admin এর নিজের center manage করার endpoints।
# সব endpoint এ coaching_admin role দরকার।

# GET  /api/v1/centers/mine/                        → নিজের center দেখা
# GET  /api/v1/centers/<id>/members/                → center এর সব members
# POST /api/v1/centers/<id>/members/add-teacher/    → teacher যোগ করা
# POST /api/v1/centers/<id>/members/add-student/    → student যোগ করা
# DELETE /api/v1/centers/<id>/members/<uid>/remove/ → member remove
# """

# from rest_framework import serializers, status
# from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.views import APIView, Response
# from django.db import IntegrityError

# from accounts.models import User, RoleName
# from centers.models import CoachingCenter, CenterMembership, CenterStatus


# def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
#     return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


# def get_admin_center(user):
#     """coaching_admin এর approved center return করে, না থাকলে 403."""
#     if user.role_name not in {
#         RoleName.COACHING_ADMIN, RoleName.COACHING_MANAGER, RoleName.COACHING_STAFF
#     }:
#         raise PermissionDenied('Only coaching admin can access this.')
#     center = CoachingCenter.objects.filter(
#         created_by=user, status=CenterStatus.APPROVED
#     ).first()
#     if not center:
#         raise PermissionDenied('No approved coaching center found for this user.')
#     return center


# def require_center_ownership(user, center):
#     """Center টা user এর কিনা check করে।"""
#     if center.created_by_id != user.user_id and user.role_name != RoleName.COACHING_ADMIN:
#         raise PermissionDenied('You do not have access to this center.')


# # ── Serializers ────────────────────────────────────────────────────────────────

# class MemberSerializer(serializers.ModelSerializer):
#     user_id   = serializers.IntegerField(source='user.user_id',  read_only=True)
#     name      = serializers.CharField(source='user.name',       read_only=True)
#     email     = serializers.CharField(source='user.email',      read_only=True)
#     phone     = serializers.CharField(source='user.phone',      read_only=True)
#     user_role = serializers.CharField(source='user.role_name',  read_only=True)

#     class Meta:
#         model  = CenterMembership
#         fields = ['membership_id', 'user_id', 'name', 'email', 'phone', 'user_role', 'role', 'joined_at']


# # ── Views ──────────────────────────────────────────────────────────────────────

# class MyCenterView(APIView):
#     """GET /api/v1/centers/mine/"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         center = get_admin_center(request.user)
#         from centers.serializers import CoachingCenterApplicationSerializer
#         return success_response(
#             data=CoachingCenterApplicationSerializer(center).data,
#             message='Your center fetched.'
#         )


# class CenterMemberListView(APIView):
#     """GET /api/v1/centers/<id>/members/"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, center_id):
#         try:
#             center = CoachingCenter.objects.get(coaching_center_id=center_id)
#         except CoachingCenter.DoesNotExist:
#             raise NotFound('Center not found.')
#         require_center_ownership(request.user, center)

#         role_filter = request.query_params.get('role')
#         qs = CenterMembership.objects.filter(coaching_center=center).select_related('user')
#         if role_filter:
#             qs = qs.filter(role=role_filter)

#         teachers = MemberSerializer(qs.filter(role=CenterMembership.Role.TEACHER), many=True).data
#         students  = MemberSerializer(qs.filter(role=CenterMembership.Role.STUDENT),  many=True).data

#         return success_response(data={
#             'teachers': teachers,
#             'students':  students,
#             'total_teachers': len(teachers),
#             'total_students':  len(students),
#         })


# class AddTeacherView(APIView):
#     """POST /api/v1/centers/<id>/members/add-teacher/
#     Body: { "email": "teacher@example.com" }
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, center_id):
#         try:
#             center = CoachingCenter.objects.get(coaching_center_id=center_id, status=CenterStatus.APPROVED)
#         except CoachingCenter.DoesNotExist:
#             raise NotFound('Approved center not found.')
#         require_center_ownership(request.user, center)

#         email = request.data.get('email', '').strip()
#         if not email:
#             raise ValidationError({'email': 'Email is required.'})

#         try:
#             teacher = User.objects.get(email=email)
#         except User.DoesNotExist:
#             raise NotFound(f'No user found with email: {email}')

#         if teacher.role_name != RoleName.TEACHER:
#             raise ValidationError({'email': f'{teacher.name} is not a teacher. Current role: {teacher.role_name}'})

#         try:
#             membership, created = CenterMembership.objects.get_or_create(
#                 user=teacher,
#                 coaching_center=center,
#                 defaults={'role': CenterMembership.Role.TEACHER}
#             )
#             if not created and membership.role != CenterMembership.Role.TEACHER:
#                 raise ValidationError({'email': 'This user is already a member with a different role.'})
#             if not created:
#                 raise ValidationError({'email': 'This teacher is already a member of this center.'})
#         except IntegrityError:
#             raise ValidationError({'email': 'Could not add teacher.'})

#         return success_response(
#             data=MemberSerializer(membership).data,
#             message=f'Teacher {teacher.name} added successfully.',
#             status_code=status.HTTP_201_CREATED,
#         )


# class AddStudentView(APIView):
#     """POST /api/v1/centers/<id>/members/add-student/
#     Body: { "email": "student@example.com" }
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, center_id):
#         try:
#             center = CoachingCenter.objects.get(coaching_center_id=center_id, status=CenterStatus.APPROVED)
#         except CoachingCenter.DoesNotExist:
#             raise NotFound('Approved center not found.')
#         require_center_ownership(request.user, center)

#         email = request.data.get('email', '').strip()
#         if not email:
#             raise ValidationError({'email': 'Email is required.'})

#         try:
#             student = User.objects.get(email=email)
#         except User.DoesNotExist:
#             raise NotFound(f'No user found with email: {email}')

#         if student.role_name != RoleName.STUDENT:
#             raise ValidationError({'email': f'{student.name} is not a student. Current role: {student.role_name}'})

#         try:
#             membership, created = CenterMembership.objects.get_or_create(
#                 user=student,
#                 coaching_center=center,
#                 defaults={'role': CenterMembership.Role.STUDENT}
#             )
#             if not created:
#                 raise ValidationError({'email': 'This student is already a member of this center.'})
#         except IntegrityError:
#             raise ValidationError({'email': 'Could not add student.'})

#         return success_response(
#             data=MemberSerializer(membership).data,
#             message=f'Student {student.name} added successfully.',
#             status_code=status.HTTP_201_CREATED,
#         )


# class RemoveMemberView(APIView):
#     """DELETE /api/v1/centers/<id>/members/<user_id>/remove/"""
#     permission_classes = [IsAuthenticated]

#     def delete(self, request, center_id, user_id):
#         try:
#             center = CoachingCenter.objects.get(coaching_center_id=center_id)
#         except CoachingCenter.DoesNotExist:
#             raise NotFound('Center not found.')
#         require_center_ownership(request.user, center)

#         try:
#             membership = CenterMembership.objects.get(coaching_center=center, user__user_id=user_id)
#         except CenterMembership.DoesNotExist:
#             raise NotFound('Member not found.')

#         name = membership.user.name
#         membership.delete()
#         return success_response(message=f'{name} removed from center.')

"""
Coaching Admin Dashboard Views
File location: backend/centers/coaching_admin_views.py

These views are scoped to a specific coaching center.
The logged-in coaching_admin identifies their center via CenterMembership (role=owner).
"""

from rest_framework import status, serializers as drf_serializers
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response
from rest_framework.generics import ListAPIView, DestroyAPIView
from django.db.models import Count, Q

from accounts.models import User, RoleName, UserProfile
from accounts.serializers import RegisterSerializer, UserProfileSerializer
from academics.models import Course, Batch, Enrollment, EnrollmentStatus
from centers.models import CoachingCenter, CenterMembership
from teaching.models import Subject, TeacherSubjectBatchAssignment
from accounts.utils import send_password_setup_link_email


# ─── helpers ──────────────────────────────────────────────────────────────────

def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "message": message, "data": data or {}},
        status=status_code,
    )


def get_admin_center(user):
    """Return the CoachingCenter the user owns/admins. Raise 403 if none."""
    if user.role_name not in (
        RoleName.COACHING_ADMIN,
        RoleName.COACHING_MANAGER,
        RoleName.COACHING_STAFF,
    ) and not user.is_superuser:
        raise PermissionDenied("Only coaching admins can access this resource.")

    membership = (
        CenterMembership.objects
        .filter(user=user, role=CenterMembership.Role.OWNER)
        .select_related("coaching_center")
        .first()
    )
    if not membership:
        # fallback: any membership for this user's center
        membership = (
            CenterMembership.objects
            .filter(user=user)
            .select_related("coaching_center")
            .first()
        )
    if not membership:
        raise NotFound("No coaching center found for this admin.")
    return membership.coaching_center


# ─── Serializers ──────────────────────────────────────────────────────────────

class TeacherListSerializer(drf_serializers.ModelSerializer):
    subject_specialization = drf_serializers.SerializerMethodField()
    assigned_subjects = drf_serializers.SerializerMethodField()
    student_count = drf_serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id", "name", "email", "phone", "gender",
            "is_active", "created_at",
            "subject_specialization", "assigned_subjects", "student_count",
        ]

    def get_subject_specialization(self, obj):
        profile = getattr(obj, "profile", None)
        return profile.subject_specialization if profile else ""

    def get_assigned_subjects(self, obj):
        center = self.context.get("center")
        if not center:
            return []
        assignments = TeacherSubjectBatchAssignment.objects.filter(
            teacher=obj,
            coaching_center=center,
            is_active=True,
        ).select_related("subject", "batch")
        return [
            {
                "assignment_id": a.assignment_id,
                "subject_name": a.subject.subject_name,
                "batch_name": a.batch.batch_name,
                "batch_id": a.batch.batch_id,
            }
            for a in assignments
        ]

    def get_student_count(self, obj):
        center = self.context.get("center")
        if not center:
            return 0
        batch_ids = TeacherSubjectBatchAssignment.objects.filter(
            teacher=obj, coaching_center=center, is_active=True
        ).values_list("batch_id", flat=True)
        return (
            Enrollment.objects
            .filter(batch_id__in=batch_ids, enrollment_status=EnrollmentStatus.ACTIVE)
            .values("student_id")
            .distinct()
            .count()
        )


class StudentListSerializer(drf_serializers.ModelSerializer):
    batch_name = drf_serializers.SerializerMethodField()
    course_name = drf_serializers.SerializerMethodField()
    enrollment_id = drf_serializers.SerializerMethodField()
    enrolled_at = drf_serializers.SerializerMethodField()
    guardian_name = drf_serializers.SerializerMethodField()
    roll_number = drf_serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id", "name", "email", "phone", "is_active", "created_at",
            "batch_name", "course_name", "enrollment_id",
            "enrolled_at", "guardian_name", "roll_number",
        ]

    def _get_enrollment(self, obj):
        enrollments = self.context.get("enrollments", {})
        return enrollments.get(obj.user_id)

    def get_batch_name(self, obj):
        e = self._get_enrollment(obj)
        return e.batch.batch_name if e else ""

    def get_course_name(self, obj):
        e = self._get_enrollment(obj)
        return e.batch.course.course_title if e else ""

    def get_enrollment_id(self, obj):
        e = self._get_enrollment(obj)
        return e.enrollment_id if e else None

    def get_enrolled_at(self, obj):
        e = self._get_enrollment(obj)
        return e.enrolled_at.isoformat() if e else None

    def get_guardian_name(self, obj):
        profile = getattr(obj, "profile", None)
        return profile.guardian_name if profile else ""

    def get_roll_number(self, obj):
        profile = getattr(obj, "profile", None)
        return profile.roll_number if profile else ""


class SubjectWithAssignmentSerializer(drf_serializers.ModelSerializer):
    teacher_name = drf_serializers.SerializerMethodField()
    teacher_id = drf_serializers.SerializerMethodField()
    assignment_id = drf_serializers.SerializerMethodField()
    batch_names = drf_serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            "subject_id", "subject_name", "subject_code",
            "teacher_id", "teacher_name",
            "assignment_id", "batch_names",
            "is_active",
        ]

    def _get_assignment(self, obj):
        assignments = self.context.get("assignments", {})
        return assignments.get(obj.subject_id)

    def get_teacher_name(self, obj):
        a = self._get_assignment(obj)
        return a.teacher.name if a else (obj.teacher.name if obj.teacher else "—")

    def get_teacher_id(self, obj):
        a = self._get_assignment(obj)
        return a.teacher.user_id if a else (obj.teacher.user_id if obj.teacher else None)

    def get_assignment_id(self, obj):
        a = self._get_assignment(obj)
        return a.assignment_id if a else None

    def get_batch_names(self, obj):
        all_assignments = self.context.get("all_assignments_by_subject", {})
        return [x.batch.batch_name for x in all_assignments.get(obj.subject_id, [])]


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

class CoachingAdminDashboardView(APIView):
    """GET /api/v1/coaching/dashboard/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        center = get_admin_center(request.user)

        total_courses = Course.objects.filter(
            coaching_center=center, is_archived=False
        ).count()

        total_batches = Batch.objects.filter(coaching_center=center).count()

        running_batches = Batch.objects.filter(
            coaching_center=center, status="running"
        ).count()

        teacher_ids = CenterMembership.objects.filter(
            coaching_center=center, role=CenterMembership.Role.TEACHER
        ).values_list("user_id", flat=True)
        total_teachers = len(teacher_ids)

        center_batch_ids = Batch.objects.filter(
            coaching_center=center
        ).values_list("batch_id", flat=True)

        total_students = (
            Enrollment.objects
            .filter(
                batch_id__in=center_batch_ids,
                enrollment_status=EnrollmentStatus.ACTIVE,
            )
            .values("student_id")
            .distinct()
            .count()
        )

        # Recent enrollments (last 5)
        recent_enrollments = (
            Enrollment.objects
            .filter(batch__coaching_center=center)
            .select_related("student", "batch__course")
            .order_by("-enrolled_at")[:5]
        )

        recent_list = [
            {
                "enrollment_id": e.enrollment_id,
                "student_name": e.student.name,
                "course_name": e.batch.course.course_title,
                "batch_name": e.batch.batch_name,
                "enrolled_at": e.enrolled_at.isoformat(),
                "status": e.enrollment_status,
            }
            for e in recent_enrollments
        ]

        # Course summary
        courses = Course.objects.filter(
            coaching_center=center, is_archived=False
        ).annotate(
            batch_count=Count("batches"),
        )[:6]

        course_summary = []
        for c in courses:
            batch_ids = Batch.objects.filter(course=c).values_list("batch_id", flat=True)
            student_count = (
                Enrollment.objects
                .filter(batch_id__in=batch_ids, enrollment_status=EnrollmentStatus.ACTIVE)
                .values("student_id").distinct().count()
            )
            course_summary.append({
                "course_id": c.course_id,
                "course_title": c.course_title,
                "batch_count": c.batch_count,
                "student_count": student_count,
                "fee": str(c.fee),
            })

        return success_response(data={
            "center": {
                "coaching_center_id": center.coaching_center_id,
                "center_name": center.center_name,
                "location": center.location,
            },
            "stats": {
                "total_courses": total_courses,
                "total_batches": total_batches,
                "running_batches": running_batches,
                "total_teachers": total_teachers,
                "total_students": total_students,
            },
            "recent_enrollments": recent_list,
            "course_summary": course_summary,
        })


# ─── Teacher Management ───────────────────────────────────────────────────────

class CoachingTeacherListCreateView(APIView):
    """
    GET  /api/v1/coaching/teachers/   — list all teachers of the center
    POST /api/v1/coaching/teachers/   — create + add teacher to center
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        center = get_admin_center(request.user)
        teacher_ids = CenterMembership.objects.filter(
            coaching_center=center,
            role=CenterMembership.Role.TEACHER,
        ).values_list("user_id", flat=True)

        teachers = (
            User.objects
            .filter(user_id__in=teacher_ids)
            .select_related("profile")
            .order_by("name")
        )
        serializer = TeacherListSerializer(
            teachers, many=True, context={"center": center}
        )
        return success_response(data={"results": serializer.data})

    def post(self, request):
        center = get_admin_center(request.user)
        data = {**request.data, "role": RoleName.TEACHER}
        serializer = RegisterSerializer(data=data, context={"creator": request.user})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Add to center membership
        CenterMembership.objects.get_or_create(
            user=user,
            coaching_center=center,
            defaults={"role": CenterMembership.Role.TEACHER},
        )

        send_password_setup_link_email(user)
        return success_response(
            data={
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "role": user.role_name,
            },
            message="Teacher created. Password setup email sent.",
            status_code=status.HTTP_201_CREATED,
        )


class CoachingTeacherDetailView(APIView):
    """DELETE /api/v1/coaching/teachers/<user_id>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        center = get_admin_center(request.user)
        try:
            membership = CenterMembership.objects.get(
                user_id=user_id,
                coaching_center=center,
                role=CenterMembership.Role.TEACHER,
            )
        except CenterMembership.DoesNotExist:
            raise NotFound("Teacher not found in this center.")

        teacher_name = membership.user.name
        # Deactivate all assignments
        TeacherSubjectBatchAssignment.objects.filter(
            teacher_id=user_id, coaching_center=center
        ).update(is_active=False)

        membership.delete()
        return success_response(message=f"Teacher '{teacher_name}' removed from center.")


# ─── Student Management ───────────────────────────────────────────────────────

class CoachingStudentListView(APIView):
    """GET /api/v1/coaching/students/?course_id=&batch_id="""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        center = get_admin_center(request.user)
        center_batch_ids = Batch.objects.filter(
            coaching_center=center
        ).values_list("batch_id", flat=True)

        qs = Enrollment.objects.filter(
            batch_id__in=center_batch_ids,
            enrollment_status=EnrollmentStatus.ACTIVE,
        ).select_related("student__profile", "batch__course")

        # optional filters
        course_id = request.query_params.get("course_id")
        batch_id = request.query_params.get("batch_id")
        if course_id:
            qs = qs.filter(batch__course_id=course_id)
        if batch_id:
            qs = qs.filter(batch_id=batch_id)

        # build lookup: student_id -> enrollment
        enrollments_map = {e.student_id: e for e in qs}
        students = (
            User.objects
            .filter(user_id__in=enrollments_map.keys())
            .select_related("profile")
            .order_by("name")
        )
        serializer = StudentListSerializer(
            students, many=True,
            context={"enrollments": enrollments_map}
        )
        return success_response(data={"results": serializer.data})


class CoachingStudentDeleteView(APIView):
    """DELETE /api/v1/coaching/students/<enrollment_id>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, enrollment_id):
        center = get_admin_center(request.user)
        try:
            enrollment = Enrollment.objects.select_related(
                "student", "batch__coaching_center"
            ).get(enrollment_id=enrollment_id)
        except Enrollment.DoesNotExist:
            raise NotFound("Enrollment not found.")

        if enrollment.batch.coaching_center_id != center.coaching_center_id:
            raise PermissionDenied("This enrollment does not belong to your center.")

        student_name = enrollment.student.name
        enrollment.enrollment_status = EnrollmentStatus.DROPPED
        enrollment.save(update_fields=["enrollment_status", "updated_at"])
        return success_response(message=f"Student '{student_name}' removed from batch.")


class CoachingEnrollStudentView(APIView):
    """POST /api/v1/coaching/students/enroll/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        center = get_admin_center(request.user)
        batch_id = request.data.get("batch_id")
        student_id = request.data.get("student_id")

        if not batch_id or not student_id:
            return Response(
                {"success": False, "message": "batch_id and student_id required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            batch = Batch.objects.get(batch_id=batch_id, coaching_center=center)
        except Batch.DoesNotExist:
            raise NotFound("Batch not found in this center.")

        try:
            student = User.objects.get(user_id=student_id)
        except User.DoesNotExist:
            raise NotFound("Student not found.")

        if Enrollment.objects.filter(batch=batch, student=student).exists():
            return Response(
                {"success": False, "message": "Student already enrolled in this batch."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollment = Enrollment.objects.create(
            batch=batch,
            student=student,
            enrollment_status=EnrollmentStatus.ACTIVE,
        )

        # Add to center membership if not already
        CenterMembership.objects.get_or_create(
            user=student,
            coaching_center=center,
            defaults={"role": CenterMembership.Role.STUDENT},
        )

        return success_response(
            data={"enrollment_id": enrollment.enrollment_id},
            message="Student enrolled successfully.",
            status_code=status.HTTP_201_CREATED,
        )


# ─── Subject / Teacher Assignment ─────────────────────────────────────────────

class CoachingSubjectListView(APIView):
    """GET /api/v1/coaching/courses/<course_id>/subjects/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        center = get_admin_center(request.user)
        subjects = Subject.objects.filter(
            course_id=course_id, coaching_center=center, is_active=True
        ).select_related("teacher")

        # build assignment maps
        all_assignments = TeacherSubjectBatchAssignment.objects.filter(
            subject__in=subjects, coaching_center=center, is_active=True
        ).select_related("teacher", "batch")

        assignments_by_subject = {}
        all_by_subject = {}
        for a in all_assignments:
            assignments_by_subject.setdefault(a.subject_id, a)  # keep first
            all_by_subject.setdefault(a.subject_id, []).append(a)

        serializer = SubjectWithAssignmentSerializer(
            subjects, many=True,
            context={
                "assignments": assignments_by_subject,
                "all_assignments_by_subject": all_by_subject,
            }
        )
        return success_response(data={"results": serializer.data})


class CoachingAssignTeacherView(APIView):
    """POST /api/v1/coaching/assignments/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from teaching.serializers import TeacherSubjectBatchAssignmentSerializer
        from teaching.utils import send_teacher_assignment_email
        center = get_admin_center(request.user)
        data = {**request.data, "coaching_center": center.coaching_center_id}
        serializer = TeacherSubjectBatchAssignmentSerializer(
            data=data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        try:
            send_teacher_assignment_email(assignment)
        except Exception:
            pass
        return success_response(
            data=serializer.data,
            message="Teacher assigned successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class CoachingAssignmentDeleteView(APIView):
    """DELETE /api/v1/coaching/assignments/<assignment_id>/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, assignment_id):
        center = get_admin_center(request.user)
        try:
            assignment = TeacherSubjectBatchAssignment.objects.get(
                assignment_id=assignment_id, coaching_center=center
            )
        except TeacherSubjectBatchAssignment.DoesNotExist:
            raise NotFound("Assignment not found.")
        assignment.is_active = False
        assignment.save(update_fields=["is_active"])
        return success_response(message="Assignment removed.")


# ─── Results ──────────────────────────────────────────────────────────────────

class CoachingBatchResultView(APIView):
    """GET /api/v1/coaching/results/?batch_id=&exam_id="""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from exams.models import ExamResult, Exam
        from exams.serializers import ExamResultSerializer
        center = get_admin_center(request.user)
        batch_id = request.query_params.get("batch_id")
        exam_id = request.query_params.get("exam_id")

        if not batch_id:
            return Response(
                {"success": False, "message": "batch_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            batch = Batch.objects.get(batch_id=batch_id, coaching_center=center)
        except Batch.DoesNotExist:
            raise NotFound("Batch not found in this center.")

        if exam_id:
            results = ExamResult.objects.filter(
                exam_id=exam_id, exam__batch=batch
            ).select_related("student", "exam__subject")
        else:
            results = ExamResult.objects.filter(
                exam__batch=batch
            ).select_related("student", "exam__subject")

        serializer = ExamResultSerializer(results, many=True)
        return success_response(data={"results": serializer.data})


# ─── Center Info ──────────────────────────────────────────────────────────────

class MyCoachingCenterView(APIView):
    """GET /api/v1/coaching/center/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        center = get_admin_center(request.user)
        from centers.serializers import CoachingCenterApplicationSerializer
        return success_response(
            data=CoachingCenterApplicationSerializer(center).data
        )
