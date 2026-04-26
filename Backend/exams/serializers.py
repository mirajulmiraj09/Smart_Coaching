from rest_framework import serializers

from exams.models import ExamResult, StudentAnswer


class ManualReviewSerializer(serializers.Serializer):
    """Payload for teacher manual override on a single answer."""
    answer_id = serializers.IntegerField()
    marks_obtained = serializers.DecimalField(max_digits=5, decimal_places=2)
    feedback = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_marks_obtained(self, value):
        if value < 0:
            raise serializers.ValidationError('marks_obtained cannot be negative.')
        return value


class ExamResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    is_published = serializers.SerializerMethodField()

    class Meta:
        model = ExamResult
        fields = [
            'result_id', 'exam', 'student', 'student_name', 'student_email',
            'total_marks_obtained', 'total_marks', 'percentage',
            'grade', 'result_status', 'published_at', 'is_published',
        ]
        read_only_fields = fields

    def get_is_published(self, obj):
        return obj.published_at is not None


class StudentAnswerDetailSerializer(serializers.ModelSerializer):
    """Full answer detail including evaluation — for teacher review screen."""
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    correct_option = serializers.CharField(source='question.correct_option', read_only=True)
    evaluated_by_name = serializers.CharField(source='evaluated_by.name', read_only=True)

    class Meta:
        model = StudentAnswer
        fields = [
            'answer_id', 'question', 'question_text', 'question_type',
            'selected_option', 'descriptive_answer', 'correct_option',
            'marks_obtained', 'evaluated_by', 'evaluated_by_name',
            'confidence_score', 'feedback', 'answer_status',
            'answered_at', 'evaluated_at',
        ]
        read_only_fields = fields