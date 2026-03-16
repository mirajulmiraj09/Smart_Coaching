from rest_framework import serializers
from centers.models import CoachingCenter, CenterStatus


class CoachingCenterApplicationSerializer(serializers.ModelSerializer):
	created_by = serializers.SerializerMethodField()
	reviewed_by = serializers.SerializerMethodField()

	class Meta:
		model = CoachingCenter
		fields = [
			'coaching_center_id',
			'center_name',
			'location',
			'address',
			'contact_number',
			'email',
			'website',
			'logo',
			'established_date',
			'access_type',
			'status',
			'description',
			'review_note',
			'created_by',
			'reviewed_by',
			'reviewed_at',
			'created_at',
			'updated_at',
		]
		read_only_fields = [
			'coaching_center_id',
			'status',
			'review_note',
			'created_by',
			'reviewed_by',
			'reviewed_at',
			'created_at',
			'updated_at',
		]

	def get_created_by(self, obj):
		if not obj.created_by:
			return None
		return {
			'user_id': obj.created_by.user_id,
			'name': obj.created_by.name,
			'email': obj.created_by.email,
			'role': obj.created_by.role_name,
		}

	def get_reviewed_by(self, obj):
		if not obj.reviewed_by:
			return None
		return {
			'user_id': obj.reviewed_by.user_id,
			'name': obj.reviewed_by.name,
			'email': obj.reviewed_by.email,
			'role': obj.reviewed_by.role_name,
		}

	def create(self, validated_data):
		request = self.context['request']
		return CoachingCenter.objects.create(
			**validated_data,
			created_by=request.user,
			status=CenterStatus.PENDING,
		)


class CenterApplicationDecisionSerializer(serializers.Serializer):
	decision = serializers.ChoiceField(choices=['approve', 'reject'])
	review_note = serializers.CharField(required=False, allow_blank=True)
