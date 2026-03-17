from rest_framework import serializers
from accounts.models import RoleName
from academics.models import Course, Batch
from centers.models import CoachingCenter, CenterMembership
from teaching.models import Subject, TeachingMaterial, TeacherSubjectBatchAssignment


class SubjectSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model = Subject
        fields = [
            'subject_id', 'course', 'coaching_center', 'teacher',
            'teacher_name', 'subject_name', 'subject_code',
            'assigned_date', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['subject_id', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'course_id',
            'coaching_center',
            'course_title',
            'description',
            'fee',
            'duration',
            'is_archived',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['course_id', 'coaching_center', 'is_archived', 'created_at', 'updated_at']


class BatchSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Batch
        fields = [
            'batch_id',
            'course',
            'coaching_center',
            'batch_name',
            'batch_code',
            'batch_type',
            'class_shift',
            'start_date',
            'end_date',
            'max_students',
            'status',
            'enrolled_count',
            'is_full',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['batch_id', 'course', 'coaching_center', 'created_at', 'updated_at']

    def validate(self, attrs):
        if attrs.get('start_date') and attrs.get('end_date') and attrs['start_date'] >= attrs['end_date']:
            raise serializers.ValidationError('end_date must be after start_date.')
        return attrs


class TeachingMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)

    class Meta:
        model = TeachingMaterial
        fields = [
            'material_id', 'subject', 'batch', 'material_title',
            'file_type', 'file_path', 'uploaded_by', 'uploaded_by_name',
            'uploaded_at', 'created_at',
        ]
        read_only_fields = ['material_id', 'uploaded_by', 'uploaded_at', 'created_at']

    def validate(self, attrs):
        """Ensure uploader is the assigned teacher for the subject."""
        request = self.context.get('request')
        subject = attrs.get('subject') or (self.instance.subject if self.instance else None)
        if request and subject and subject.teacher != request.user:
            raise serializers.ValidationError(
                'Only the assigned teacher can upload materials for this subject.'
            )
        return attrs

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class TeacherSubjectBatchAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    teacher_email = serializers.CharField(source='teacher.email', read_only=True)
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)

    class Meta:
        model = TeacherSubjectBatchAssignment
        fields = [
            'assignment_id',
            'coaching_center',
            'course',
            'batch',
            'subject',
            'subject_name',
            'teacher',
            'teacher_name',
            'teacher_email',
            'assigned_by',
            'assigned_at',
            'is_active',
            'batch_name',
        ]
        read_only_fields = ['assignment_id', 'assigned_by', 'assigned_at', 'is_active']

    def validate(self, attrs):
        teacher = attrs['teacher']
        center = attrs['coaching_center']
        course = attrs['course']
        batch = attrs['batch']
        subject = attrs['subject']

        if teacher.role_name != RoleName.TEACHER:
            raise serializers.ValidationError({'teacher': 'Selected user must have teacher role.'})

        if course.coaching_center_id != center.coaching_center_id:
            raise serializers.ValidationError({'course': 'Course does not belong to the selected coaching center.'})

        if batch.course_id != course.course_id:
            raise serializers.ValidationError({'batch': 'Batch does not belong to the selected course.'})

        if batch.coaching_center_id != center.coaching_center_id:
            raise serializers.ValidationError({'batch': 'Batch does not belong to the selected coaching center.'})

        if subject.course_id != course.course_id:
            raise serializers.ValidationError({'subject': 'Subject does not belong to the selected course.'})

        if subject.coaching_center_id != center.coaching_center_id:
            raise serializers.ValidationError({'subject': 'Subject does not belong to the selected coaching center.'})

        is_member = CenterMembership.objects.filter(
            coaching_center=center,
            user=teacher,
            role=CenterMembership.Role.TEACHER,
        ).exists()
        if not is_member:
            raise serializers.ValidationError({'teacher': 'Teacher is not a member of this coaching center.'})

        return attrs

    def create(self, validated_data):
        validated_data['assigned_by'] = self.context['request'].user
        return super().create(validated_data)