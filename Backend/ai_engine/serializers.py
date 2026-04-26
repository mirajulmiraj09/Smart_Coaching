from rest_framework import serializers

from ai_engine.models import LLMEvaluationLog


class GenerateQuestionsSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    material_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    count = serializers.IntegerField(min_value=1, max_value=20, default=5)
    difficulty = serializers.ChoiceField(choices=['easy', 'medium', 'hard'], default='medium')


class EvaluateDescriptiveSerializer(serializers.Serializer):
    exam_id = serializers.IntegerField()


class LLMEvaluationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LLMEvaluationLog
        fields = '__all__'
        read_only_fields = fields