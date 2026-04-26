# centers/coaching_admin_views.py  (নতুন ফাইল)
"""
Coaching Admin এর নিজের center manage করার endpoints।
সব endpoint এ coaching_admin role দরকার।

GET  /api/v1/centers/mine/                        → নিজের center দেখা
GET  /api/v1/centers/<id>/members/                → center এর সব members
POST /api/v1/centers/<id>/members/add-teacher/    → teacher যোগ করা
POST /api/v1/centers/<id>/members/add-student/    → student যোগ করা
DELETE /api/v1/centers/<id>/members/<uid>/remove/ → member remove
"""

from rest_framework import serializers, status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response
from django.db import IntegrityError

from accounts.models import User, RoleName
from centers.models import CoachingCenter, CenterMembership, CenterStatus


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


def get_admin_center(user):
    """coaching_admin এর approved center return করে, না থাকলে 403."""
    if user.role_name not in {
        RoleName.COACHING_ADMIN, RoleName.COACHING_MANAGER, RoleName.COACHING_STAFF
    }:
        raise PermissionDenied('Only coaching admin can access this.')
    center = CoachingCenter.objects.filter(
        created_by=user, status=CenterStatus.APPROVED
    ).first()
    if not center:
        raise PermissionDenied('No approved coaching center found for this user.')
    return center


def require_center_ownership(user, center):
    """Center টা user এর কিনা check করে।"""
    if center.created_by_id != user.user_id and user.role_name != RoleName.COACHING_ADMIN:
        raise PermissionDenied('You do not have access to this center.')


# ── Serializers ────────────────────────────────────────────────────────────────

class MemberSerializer(serializers.ModelSerializer):
    user_id   = serializers.IntegerField(source='user.user_id',  read_only=True)
    name      = serializers.CharField(source='user.name',       read_only=True)
    email     = serializers.CharField(source='user.email',      read_only=True)
    phone     = serializers.CharField(source='user.phone',      read_only=True)
    user_role = serializers.CharField(source='user.role_name',  read_only=True)

    class Meta:
        model  = CenterMembership
        fields = ['membership_id', 'user_id', 'name', 'email', 'phone', 'user_role', 'role', 'joined_at']


# ── Views ──────────────────────────────────────────────────────────────────────

class MyCenterView(APIView):
    """GET /api/v1/centers/mine/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        center = get_admin_center(request.user)
        from centers.serializers import CoachingCenterApplicationSerializer
        return success_response(
            data=CoachingCenterApplicationSerializer(center).data,
            message='Your center fetched.'
        )


class CenterMemberListView(APIView):
    """GET /api/v1/centers/<id>/members/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, center_id):
        try:
            center = CoachingCenter.objects.get(coaching_center_id=center_id)
        except CoachingCenter.DoesNotExist:
            raise NotFound('Center not found.')
        require_center_ownership(request.user, center)

        role_filter = request.query_params.get('role')
        qs = CenterMembership.objects.filter(coaching_center=center).select_related('user')
        if role_filter:
            qs = qs.filter(role=role_filter)

        teachers = MemberSerializer(qs.filter(role=CenterMembership.Role.TEACHER), many=True).data
        students  = MemberSerializer(qs.filter(role=CenterMembership.Role.STUDENT),  many=True).data

        return success_response(data={
            'teachers': teachers,
            'students':  students,
            'total_teachers': len(teachers),
            'total_students':  len(students),
        })


class AddTeacherView(APIView):
    """POST /api/v1/centers/<id>/members/add-teacher/
    Body: { "email": "teacher@example.com" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, center_id):
        try:
            center = CoachingCenter.objects.get(coaching_center_id=center_id, status=CenterStatus.APPROVED)
        except CoachingCenter.DoesNotExist:
            raise NotFound('Approved center not found.')
        require_center_ownership(request.user, center)

        email = request.data.get('email', '').strip()
        if not email:
            raise ValidationError({'email': 'Email is required.'})

        try:
            teacher = User.objects.get(email=email)
        except User.DoesNotExist:
            raise NotFound(f'No user found with email: {email}')

        if teacher.role_name != RoleName.TEACHER:
            raise ValidationError({'email': f'{teacher.name} is not a teacher. Current role: {teacher.role_name}'})

        try:
            membership, created = CenterMembership.objects.get_or_create(
                user=teacher,
                coaching_center=center,
                defaults={'role': CenterMembership.Role.TEACHER}
            )
            if not created and membership.role != CenterMembership.Role.TEACHER:
                raise ValidationError({'email': 'This user is already a member with a different role.'})
            if not created:
                raise ValidationError({'email': 'This teacher is already a member of this center.'})
        except IntegrityError:
            raise ValidationError({'email': 'Could not add teacher.'})

        return success_response(
            data=MemberSerializer(membership).data,
            message=f'Teacher {teacher.name} added successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class AddStudentView(APIView):
    """POST /api/v1/centers/<id>/members/add-student/
    Body: { "email": "student@example.com" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, center_id):
        try:
            center = CoachingCenter.objects.get(coaching_center_id=center_id, status=CenterStatus.APPROVED)
        except CoachingCenter.DoesNotExist:
            raise NotFound('Approved center not found.')
        require_center_ownership(request.user, center)

        email = request.data.get('email', '').strip()
        if not email:
            raise ValidationError({'email': 'Email is required.'})

        try:
            student = User.objects.get(email=email)
        except User.DoesNotExist:
            raise NotFound(f'No user found with email: {email}')

        if student.role_name != RoleName.STUDENT:
            raise ValidationError({'email': f'{student.name} is not a student. Current role: {student.role_name}'})

        try:
            membership, created = CenterMembership.objects.get_or_create(
                user=student,
                coaching_center=center,
                defaults={'role': CenterMembership.Role.STUDENT}
            )
            if not created:
                raise ValidationError({'email': 'This student is already a member of this center.'})
        except IntegrityError:
            raise ValidationError({'email': 'Could not add student.'})

        return success_response(
            data=MemberSerializer(membership).data,
            message=f'Student {student.name} added successfully.',
            status_code=status.HTTP_201_CREATED,
        )


class RemoveMemberView(APIView):
    """DELETE /api/v1/centers/<id>/members/<user_id>/remove/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, center_id, user_id):
        try:
            center = CoachingCenter.objects.get(coaching_center_id=center_id)
        except CoachingCenter.DoesNotExist:
            raise NotFound('Center not found.')
        require_center_ownership(request.user, center)

        try:
            membership = CenterMembership.objects.get(coaching_center=center, user__user_id=user_id)
        except CenterMembership.DoesNotExist:
            raise NotFound('Member not found.')

        name = membership.user.name
        membership.delete()
        return success_response(message=f'{name} removed from center.')