"""
System Admin — User management views.
Endpoints:
  GET    /api/v1/admin/users/             list all users (filterable by role)
  GET    /api/v1/admin/users/<user_id>/   user detail
  DELETE /api/v1/admin/users/<user_id>/   delete user
  PATCH  /api/v1/admin/users/<user_id>/activate/    activate user
  PATCH  /api/v1/admin/users/<user_id>/deactivate/  deactivate user
"""

from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response
from rest_framework.generics import ListAPIView
from rest_framework import serializers
from accounts.models import User, RoleName


# ─── helpers ──────────────────────────────────────────────────────────────────

def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "message": message, "data": data or {}},
        status=status_code,
    )


def require_superuser(user):
    if not (user and user.is_authenticated and user.is_superuser):
        raise PermissionDenied("Only system admins (superusers) can access this endpoint.")


# ─── Serializer ────────────────────────────────────────────────────────────────

class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="role_name", read_only=True)

    class Meta:
        model = User
        fields = [
            "user_id",
            "name",
            "email",
            "phone",
            "gender",
            "role",
            "email_verified",
            "is_active",
            "is_staff",
            "is_superuser",
            "created_at",
            "updated_at",
        ]


# ─── List all users ────────────────────────────────────────────────────────────

class AdminUserListView(ListAPIView):
    """GET /api/v1/admin/users/   ?role=coaching_admin|student|... optional"""

    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_superuser(self.request.user)
        qs = User.objects.select_related("role").order_by("-created_at")

        role_filter = self.request.query_params.get("role")
        if role_filter:
            qs = qs.filter(role__role_name=role_filter)

        return qs


# ─── Single user detail + delete ──────────────────────────────────────────────

class AdminUserDetailView(APIView):
    """GET / DELETE /api/v1/admin/users/<user_id>/"""

    permission_classes = [IsAuthenticated]

    def _get_user(self, user_id):
        try:
            return User.objects.select_related("role").get(user_id=user_id)
        except User.DoesNotExist as exc:
            raise NotFound("User not found.") from exc

    def get(self, request, user_id):
        require_superuser(request.user)
        user = self._get_user(user_id)
        return success_response(data=AdminUserSerializer(user).data)

    def delete(self, request, user_id):
        require_superuser(request.user)
        if int(user_id) == request.user.user_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You cannot delete your own account.")
        user = self._get_user(user_id)
        name = user.name
        user.delete()
        return success_response(message=f"User '{name}' deleted successfully.")


# ─── Activate / Deactivate ────────────────────────────────────────────────────

class AdminUserActivateView(APIView):
    """PATCH /api/v1/admin/users/<user_id>/activate/"""

    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        require_superuser(request.user)
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist as exc:
            raise NotFound("User not found.") from exc

        user.is_active = True
        user.save(update_fields=["is_active", "updated_at"])
        return success_response(
            data={"user_id": user.user_id, "is_active": user.is_active},
            message="User activated successfully.",
        )


class AdminUserDeactivateView(APIView):
    """PATCH /api/v1/admin/users/<user_id>/deactivate/"""

    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        require_superuser(request.user)
        if int(user_id) == request.user.user_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You cannot deactivate your own account.")
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist as exc:
            raise NotFound("User not found.") from exc

        user.is_active = False
        user.save(update_fields=["is_active", "updated_at"])
        return success_response(
            data={"user_id": user.user_id, "is_active": user.is_active},
            message="User deactivated successfully.",
        )
