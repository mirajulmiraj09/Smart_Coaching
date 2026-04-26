"""
System Admin views — requires is_superuser=True on the JWT user.
Endpoints:
  GET  /api/v1/admin/centers/applications/          list ALL applications (any status)
  POST /api/v1/admin/centers/applications/<id>/review/  approve / reject
  DELETE /api/v1/admin/centers/applications/<id>/   hard-delete an application
  GET  /api/v1/admin/centers/                       list ALL coaching centers
  GET  /api/v1/admin/centers/<id>/                  single center detail
  DELETE /api/v1/admin/centers/<id>/                delete a center
"""

from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.generics import ListAPIView, RetrieveDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response
from accounts.models import Role, RoleName
from accounts.utils import send_email_and_store_notification
from centers.models import CoachingCenter, CenterStatus
from centers.serializers import (
    CoachingCenterApplicationSerializer,
    CenterApplicationDecisionSerializer,
)


# ─── helpers ──────────────────────────────────────────────────────────────────

def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "message": message, "data": data or {}},
        status=status_code,
    )


def require_superuser(user):
    """Raise PermissionDenied unless the user is a superuser."""
    if not (user and user.is_authenticated and user.is_superuser):
        raise PermissionDenied("Only system admins (superusers) can access this endpoint.")


def send_review_email(center, decision, sender):
    """Send approval / rejection email to the coaching-admin applicant."""
    if not center.created_by:
        return
    if decision == "approve":
        subject = "Coaching Admin Application Approved — Smart Coaching Center"
        message = (
            f"Hi {center.created_by.name},\n\n"
            f"Your coaching admin application for '{center.center_name}' has been approved.\n"
            "You can now manage your coaching center dashboard.\n\nThank you."
        )
    else:
        subject = "Coaching Admin Application Rejected — Smart Coaching Center"
        message = (
            f"Hi {center.created_by.name},\n\n"
            f"We regret to inform you that your coaching admin application for "
            f"'{center.center_name}' has been rejected.\n"
            f"Review note: {center.review_note or 'N/A'}\n\nThank you."
        )
    send_email_and_store_notification(
        user=center.created_by,
        subject=subject,
        message=message,
        sender=sender,
    )


# ─── Application list (all statuses) ──────────────────────────────────────────

class AdminAllApplicationsListView(ListAPIView):
    """GET /api/v1/admin/centers/applications/"""

    serializer_class = CoachingCenterApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_superuser(self.request.user)
        qs = CoachingCenter.objects.select_related("created_by", "reviewed_by")

        # optional ?status=pending|approved|rejected filter
        status_filter = self.request.query_params.get("status")
        if status_filter in (CenterStatus.PENDING, CenterStatus.APPROVED, CenterStatus.REJECTED):
            qs = qs.filter(status=status_filter)

        return qs.order_by("-created_at")


# ─── Application review (approve / reject) ────────────────────────────────────

class AdminApplicationReviewView(APIView):
    """POST /api/v1/admin/centers/applications/<coaching_center_id>/review/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, coaching_center_id):
        require_superuser(request.user)

        serializer = CenterApplicationDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            center = CoachingCenter.objects.select_related("created_by", "reviewed_by").get(
                coaching_center_id=coaching_center_id
            )
        except CoachingCenter.DoesNotExist as exc:
            raise NotFound("Coaching center application not found.") from exc

        if center.status != CenterStatus.PENDING:
            raise ValidationError({"status": "Only pending applications can be reviewed."})

        decision = serializer.validated_data["decision"]
        center.status = CenterStatus.APPROVED if decision == "approve" else CenterStatus.REJECTED
        center.review_note = serializer.validated_data.get("review_note", "")
        center.reviewed_by = request.user
        center.reviewed_at = timezone.now()
        center.save(update_fields=["status", "review_note", "reviewed_by", "reviewed_at", "updated_at"])

        # If approved → promote applicant to coaching_admin role & activate account
        if decision == "approve" and center.created_by:
            coaching_admin_role, _ = Role.objects.get_or_create(
                role_name=RoleName.COACHING_ADMIN,
                defaults={"description": "Coaching Admin"},
            )
            applicant = center.created_by
            changed_fields = ["updated_at"]
            if applicant.role_id != coaching_admin_role.role_id:
                applicant.role = coaching_admin_role
                changed_fields.append("role")
            if not applicant.is_active:
                applicant.is_active = True
                changed_fields.append("is_active")
            applicant.save(update_fields=changed_fields)

        send_review_email(center, decision, request.user)

        message = (
            "Application approved successfully."
            if decision == "approve"
            else "Application rejected successfully."
        )
        return success_response(
            data=CoachingCenterApplicationSerializer(center).data,
            message=message,
        )


# ─── Application delete ────────────────────────────────────────────────────────

class AdminApplicationDeleteView(APIView):
    """DELETE /api/v1/admin/centers/applications/<coaching_center_id>/"""

    permission_classes = [IsAuthenticated]

    def delete(self, request, coaching_center_id):
        require_superuser(request.user)

        try:
            center = CoachingCenter.objects.get(coaching_center_id=coaching_center_id)
        except CoachingCenter.DoesNotExist as exc:
            raise NotFound("Coaching center application not found.") from exc

        center_name = center.center_name
        center.delete()
        return success_response(message=f"Application '{center_name}' deleted successfully.")


# ─── All coaching centers ──────────────────────────────────────────────────────

class AdminAllCentersListView(ListAPIView):
    """GET /api/v1/admin/centers/"""

    serializer_class = CoachingCenterApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        require_superuser(self.request.user)
        return CoachingCenter.objects.select_related("created_by", "reviewed_by").order_by("-created_at")


class AdminCenterDetailView(APIView):
    """GET /api/v1/admin/centers/<coaching_center_id>/"""

    permission_classes = [IsAuthenticated]

    def get(self, request, coaching_center_id):
        require_superuser(request.user)
        try:
            center = CoachingCenter.objects.select_related("created_by", "reviewed_by").get(
                coaching_center_id=coaching_center_id
            )
        except CoachingCenter.DoesNotExist as exc:
            raise NotFound("Coaching center not found.") from exc
        return success_response(data=CoachingCenterApplicationSerializer(center).data)

    def delete(self, request, coaching_center_id):
        require_superuser(request.user)
        try:
            center = CoachingCenter.objects.get(coaching_center_id=coaching_center_id)
        except CoachingCenter.DoesNotExist as exc:
            raise NotFound("Coaching center not found.") from exc

        name = center.center_name
        center.delete()
        return success_response(message=f"Coaching center '{name}' deleted successfully.")
