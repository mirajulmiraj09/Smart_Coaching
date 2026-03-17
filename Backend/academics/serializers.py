from rest_framework import serializers
from academics.models import Course, Batch, Enrollment, EnrollmentStatus


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'course_id', 'coaching_center', 'course_title',
            'description', 'fee', 'duration', 'is_archived',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['course_id', 'created_at', 'updated_at']


class BatchSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Batch
        fields = [
            'batch_id', 'course', 'coaching_center', 'batch_name',
            'batch_code', 'batch_type', 'class_shift', 'start_date',
            'end_date', 'max_students', 'status', 'enrolled_count',
            'is_full', 'created_at', 'updated_at',
        ]
        read_only_fields = ['batch_id', 'created_at', 'updated_at']

    def validate(self, attrs):
        if attrs.get('start_date') and attrs.get('end_date'):
            if attrs['start_date'] >= attrs['end_date']:
                raise serializers.ValidationError('end_date must be after start_date.')
        return attrs


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = [
            'enrollment_id', 'batch', 'student',
            'enrollment_status', 'enrolled_at', 'updated_at',
        ]
        read_only_fields = ['enrollment_id', 'enrolled_at', 'updated_at']

    def validate(self, attrs):
        batch = attrs.get('batch') or self.instance.batch
        student = attrs.get('student') or self.instance.student

        # Prevent duplicate active enrollment
        if not self.instance:
            qs = Enrollment.objects.filter(batch=batch, student=student)
            if qs.exists():
                raise serializers.ValidationError(
                    'This student is already enrolled in the batch.'
                )
        return attrs


class EnrolledStudentSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing students in a batch."""
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['enrollment_id', 'student', 'student_name', 'student_email', 'enrollment_status', 'enrolled_at']