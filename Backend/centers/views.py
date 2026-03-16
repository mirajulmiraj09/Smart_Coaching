from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import Response
from centers.models import CoachingCenter, CenterStatus
from centers.serializers import CoachingCenterApplicationSerializer, CenterApplicationDecisionSerializer


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
	return Response(
		{
			'success': True,
			'message': message,
			'data': data or {},
		},
		status=status_code,
	)


def is_center_reviewer(user):
	return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))

class CenterApplicationCreateView(CreateAPIView):
	"""POST /api/v1/centers/applications/"""

	serializer_class = CoachingCenterApplicationSerializer
	permission_classes = [IsAuthenticated]

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		center = serializer.save()

		return success_response(
			data=CoachingCenterApplicationSerializer(center).data,
			message='Coaching center application submitted and pending review.',
			status_code=status.HTTP_201_CREATED,
		)


class PendingCenterApplicationListView(ListAPIView):
	"""GET /api/v1/centers/applications/pending/"""

	serializer_class = CoachingCenterApplicationSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		if not is_center_reviewer(self.request.user):
			raise PermissionDenied('Only staff or superuser can view pending applications.')
		return CoachingCenter.objects.filter(status=CenterStatus.PENDING).select_related('created_by', 'reviewed_by')


class MyCenterApplicationListView(ListAPIView):
	"""GET /api/v1/centers/applications/my/"""

	serializer_class = CoachingCenterApplicationSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return CoachingCenter.objects.filter(created_by=self.request.user).select_related('created_by', 'reviewed_by')


class CenterApplicationReviewView(CreateAPIView):
	"""POST /api/v1/centers/applications/{coaching_center_id}/review/"""

	permission_classes = [IsAuthenticated]
	serializer_class = CenterApplicationDecisionSerializer

	def create(self, request, *args, **kwargs):
		coaching_center_id = kwargs.get('coaching_center_id')
		if not is_center_reviewer(request.user):
			raise PermissionDenied('Only staff or superuser can approve or reject applications.')

		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		try:
			center = CoachingCenter.objects.select_related('created_by', 'reviewed_by').get(
				coaching_center_id=coaching_center_id
			)
		except CoachingCenter.DoesNotExist as exc:
			raise NotFound('Coaching center application not found.') from exc

		if center.status != CenterStatus.PENDING:
			raise ValidationError({'status': 'Only pending applications can be reviewed.'})

		decision = serializer.validated_data['decision']
		center.status = CenterStatus.APPROVED if decision == 'approve' else CenterStatus.REJECTED
		center.review_note = serializer.validated_data.get('review_note', '')
		center.reviewed_by = request.user
		center.reviewed_at = timezone.now()
		center.save(update_fields=['status', 'review_note', 'reviewed_by', 'reviewed_at', 'updated_at'])

		message = 'Application approved successfully.' if decision == 'approve' else 'Application rejected successfully.'
		return success_response(
			data=CoachingCenterApplicationSerializer(center).data,
			message=message,
			status_code=status.HTTP_200_OK,
		)
