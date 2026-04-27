"""
Center Membership Views
File: backend/centers/center_member_views.py

Missing endpoints needed by the Coaching Admin Dashboard frontend:

  GET    /api/v1/centers/<id>/members/              — list all teachers + students
  POST   /api/v1/centers/<id>/members/add-teacher/  — add existing user as teacher by email
  POST   /api/v1/centers/<id>/members/add-student/  — add existing user as student by email
  DELETE /api/v1/centers/<id>/members/<user_id>/remove/ — remove member from center
  GET    /api/v1/centers/mine/                       — get my coaching center
  GET    /api/v1/teaching/centers/<id>/assignments/  — list all teacher assignments of a center
"""

from rest_framework import status, serializers as drf_serializers
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response
from rest_framework.generics import ListAPIView

from accounts.models import User, RoleName
from centers.models import CoachingCenter, CenterMembership, CenterStatus
from teaching.models import TeacherSubjectBatchAssignment


# ─── helpers ──────────────────────────────────────────────────────────────────

def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "message": message, "data": data or {}},
        status=status_code,
    )


def get_center_or_404(center_id):
    try:
        return CoachingCenter.objects.get(coaching_center_id=center_id)
    except CoachingCenter.DoesNotExist:
        raise NotFound("Coaching center not found.")


def is_center_admin(user, center):
    """Check if user is owner/staff of this center OR is a superuser."""
    if user.is_superuser:
        return True
    if user.role_name in (RoleName.COACHING_ADMIN, RoleName.COACHING_MANAGER, RoleName.COACHING_STAFF):
        return CenterMembership.objects.filter(
            user=user,
            coaching_center=center,
        ).exists()
    return False


# ─── Serializers ──────────────────────────────────────────────────────────────

class MemberSerializer(drf_serializers.ModelSerializer):
    subject_specialization = drf_serializers.SerializerMethodField()
    guardian_name = drf_serializers.SerializerMethodField()
    joined_at = drf_serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id", "name", "email", "phone",
            "gender", "is_active", "created_at",
            "subject_specialization", "guardian_name", "joined_at",
        ]

    def get_subject_specialization(self, obj):
        profile = getattr(obj, "profile", None)
        return profile.subject_specialization if profile else ""

    def get_guardian_name(self, obj):
        profile = getattr(obj, "profile", None)
        return profile.guardian_name if profile else ""

    def get_joined_at(self, obj):
        center = self.context.get("center")
        if not center:
            return None
        m = CenterMembership.objects.filter(
            user=obj, coaching_center=center
        ).first()
        return m.joined_at.isoformat() if m else None


class AssignmentListSerializer(drf_serializers.ModelSerializer):
    teacher_name = drf_serializers.CharField(source="teacher.name", read_only=True)
    teacher_email = drf_serializers.CharField(source="teacher.email", read_only=True)
    subject_name = drf_serializers.CharField(source="subject.subject_name", read_only=True)
    subject_code = drf_serializers.CharField(source="subject.subject_code", read_only=True)
    batch_name = drf_serializers.CharField(source="batch.batch_name", read_only=True)
    batch_id = drf_serializers.IntegerField(source="batch.batch_id", read_only=True)
    batch_status = drf_serializers.CharField(source="batch.status", read_only=True)
    course_title = drf_serializers.CharField(source="course.course_title", read_only=True)
    enrolled_count = drf_serializers.SerializerMethodField()

    class Meta:
        model = TeacherSubjectBatchAssignment
        fields = [
            "assignment_id", "teacher", "teacher_name", "teacher_email",
            "subject_name", "subject_code",
            "batch_id", "batch_name", "batch_status",
            "course_title",
            "is_active", "assigned_at", "enrolled_count",
        ]

    def get_enrolled_count(self, obj):
        from academics.models import Enrollment, EnrollmentStatus
        return Enrollment.objects.filter(
            batch=obj.batch,
            enrollment_status=EnrollmentStatus.ACTIVE,
        ).count()


# ─── GET /centers/mine/ ───────────────────────────────────────────────────────

class MyCoachingCenterView(APIView):
    """
    GET /api/v1/centers/mine/
    Returns the coaching center where the authenticated user is owner/admin.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Try owner membership first
        membership = (
            CenterMembership.objects
            .filter(user=request.user, role=CenterMembership.Role.OWNER)
            .select_related("coaching_center")
            .first()
        )
        if not membership:
            # Fallback: any membership (manager, staff)
            membership = (
                CenterMembership.objects
                .filter(user=request.user)
                .select_related("coaching_center")
                .first()
            )

        if not membership:
            # Last fallback: check if they created a center
            center = CoachingCenter.objects.filter(
                created_by=request.user,
                status=CenterStatus.APPROVED,
            ).first()
            if not center:
                center = CoachingCenter.objects.filter(
                    created_by=request.user
                ).first()
            if not center:
                raise NotFound("No coaching center found for this user.")
        else:
            center = membership.coaching_center

        from centers.serializers import CoachingCenterApplicationSerializer
        return success_response(data=CoachingCenterApplicationSerializer(center).data)


# ─── GET /centers/<id>/members/ ───────────────────────────────────────────────

class CenterMemberListView(APIView):
    """
    GET /api/v1/centers/<center_id>/members/
    Returns teachers and students of a coaching center.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, center_id):
        center = get_center_or_404(center_id)

        teacher_ids = CenterMembership.objects.filter(
            coaching_center=center,
            role=CenterMembership.Role.TEACHER,
        ).values_list("user_id", flat=True)

        student_ids = CenterMembership.objects.filter(
            coaching_center=center,
            role=CenterMembership.Role.STUDENT,
        ).values_list("user_id", flat=True)

        teachers = User.objects.filter(user_id__in=teacher_ids).select_related("profile").order_by("name")
        students = User.objects.filter(user_id__in=student_ids).select_related("profile").order_by("name")

        ctx = {"center": center}
        return success_response(data={
            "total_teachers": teachers.count(),
            "total_students": students.count(),
            "teachers": MemberSerializer(teachers, many=True, context=ctx).data,
            "students": MemberSerializer(students, many=True, context=ctx).data,
        })


# ─── POST /centers/<id>/members/add-teacher/ ──────────────────────────────────

class AddTeacherByEmailView(APIView):
    """
    POST /api/v1/centers/<center_id>/members/add-teacher/
    Body: { "email": "teacher@example.com" }

    Adds an already-registered user with 'teacher' role to this center.
    If the user exists but has a different role, upgrades them to teacher role.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, center_id):
        center = get_center_or_404(center_id)

        if not is_center_admin(request.user, center):
            raise PermissionDenied("Only coaching admins can add teachers.")

        email = request.data.get("email", "").strip().lower()
        if not email:
            raise ValidationError({"email": "Email is required."})

        # Find user by email
        try:
            user = User.objects.select_related("role").get(email=email)
        except User.DoesNotExist:
            raise NotFound(
                f"No user found with email '{email}'. "
                "The teacher must register first via /api/v1/auth/register/ with role=teacher, "
                "or you can create them via /api/v1/auth/users/create/."
            )

        # Ensure user has teacher role (upgrade if needed)
        from accounts.models import Role
        if user.role_name != RoleName.TEACHER:
            teacher_role, _ = Role.objects.get_or_create(
                role_name=RoleName.TEACHER,
                defaults={"description": "Teacher"},
            )
            user.role = teacher_role
            user.save(update_fields=["role", "updated_at"])

        # Check already a member
        membership, created = CenterMembership.objects.get_or_create(
            user=user,
            coaching_center=center,
            defaults={"role": CenterMembership.Role.TEACHER},
        )

        if not created:
            if membership.role == CenterMembership.Role.TEACHER:
                raise ValidationError({"email": "This teacher is already a member of this center."})
            # Update role to teacher
            membership.role = CenterMembership.Role.TEACHER
            membership.save(update_fields=["role"])

        return success_response(
            data={
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "role": user.role_name,
                "membership_id": membership.membership_id,
            },
            message=f"'{user.name}' added as teacher to {center.center_name}.",
            status_code=status.HTTP_201_CREATED,
        )


# ─── POST /centers/<id>/members/add-student/ ──────────────────────────────────

class AddStudentByEmailView(APIView):
    """
    POST /api/v1/centers/<center_id>/members/add-student/
    Body: { "email": "student@example.com" }

    Adds an already-registered user to this center as a student.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, center_id):
        center = get_center_or_404(center_id)

        if not is_center_admin(request.user, center):
            raise PermissionDenied("Only coaching admins can add students.")

        email = request.data.get("email", "").strip().lower()
        if not email:
            raise ValidationError({"email": "Email is required."})

        try:
            user = User.objects.select_related("role").get(email=email)
        except User.DoesNotExist:
            raise NotFound(f"No user found with email '{email}'.")

        # Ensure student role
        from accounts.models import Role
        if user.role_name != RoleName.STUDENT:
            student_role, _ = Role.objects.get_or_create(
                role_name=RoleName.STUDENT,
                defaults={"description": "Student"},
            )
            user.role = student_role
            user.save(update_fields=["role", "updated_at"])

        membership, created = CenterMembership.objects.get_or_create(
            user=user,
            coaching_center=center,
            defaults={"role": CenterMembership.Role.STUDENT},
        )

        if not created:
            if membership.role == CenterMembership.Role.STUDENT:
                raise ValidationError({"email": "This student is already a member of this center."})
            membership.role = CenterMembership.Role.STUDENT
            membership.save(update_fields=["role"])

        return success_response(
            data={
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "membership_id": membership.membership_id,
            },
            message=f"'{user.name}' added as student to {center.center_name}.",
            status_code=status.HTTP_201_CREATED,
        )


# ─── DELETE /centers/<id>/members/<user_id>/remove/ ───────────────────────────

class RemoveMemberView(APIView):
    """
    DELETE /api/v1/centers/<center_id>/members/<user_id>/remove/
    Removes a user (teacher or student) from a coaching center.
    Does NOT delete the user account.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, center_id, user_id):
        center = get_center_or_404(center_id)

        if not is_center_admin(request.user, center):
            raise PermissionDenied("Only coaching admins can remove members.")

        if int(user_id) == request.user.user_id:
            raise ValidationError("You cannot remove yourself from the center.")

        try:
            membership = CenterMembership.objects.get(
                user_id=user_id,
                coaching_center=center,
            )
        except CenterMembership.DoesNotExist:
            raise NotFound("Member not found in this center.")

        name = membership.user.name
        role = membership.role
        membership.delete()

        return success_response(
            message=f"'{name}' ({role}) removed from {center.center_name}."
        )


# ─── GET /teaching/centers/<id>/assignments/ ─────────────────────────────────

class CenterAssignmentListView(APIView):
    """
    GET /api/v1/teaching/centers/<center_id>/assignments/
    Returns all teacher-subject-batch assignments for a coaching center.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, center_id):
        center = get_center_or_404(center_id)

        assignments = (
            TeacherSubjectBatchAssignment.objects
            .filter(coaching_center=center, is_active=True)
            .select_related("teacher", "subject", "batch", "course")
            .order_by("-assigned_at")
        )

        serializer = AssignmentListSerializer(assignments, many=True)
        return success_response(data={"results": serializer.data})
