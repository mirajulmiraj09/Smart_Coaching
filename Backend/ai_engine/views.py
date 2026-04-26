from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_engine.models import LLMEvaluationLog
from ai_engine.serializers import (
    EvaluateDescriptiveSerializer,
    GenerateQuestionsSerializer,
    LLMEvaluationLogSerializer,
)
from ai_engine.services import LLMService
from exams.models import Exam
from teaching.models import Subject, TeachingMaterial


class GenerateQuestionsView(APIView):
    """POST — generate questions from study materials via LLM."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GenerateQuestionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        subject = Subject.objects.get(pk=data['subject_id'])
        materials = TeachingMaterial.objects.filter(
            pk__in=data['material_ids'],
            subject=subject
        )
        if not materials.exists():
            return Response(
                {'detail': 'No valid materials found for this subject.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        questions = LLMService.generate_questions(
            subject=subject,
            materials=list(materials),
            count=data['count'],
            difficulty=data['difficulty'],
        )
        return Response(
            {'detail': f'{len(questions)} question(s) generated.'},
            status=status.HTTP_201_CREATED
        )


class EvaluateDescriptiveView(APIView):
    """POST — LLM evaluates all pending descriptive answers for an exam."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EvaluateDescriptiveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exam = Exam.objects.get(pk=serializer.validated_data['exam_id'])
        result = LLMService.evaluate_all_descriptive(exam)
        return Response(result, status=status.HTTP_200_OK)


class EvaluationLogListView(APIView):
    """GET — audit log of all LLM evaluations for an exam."""
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        logs = (
            LLMEvaluationLog.objects
            .filter(answer__exam_id=exam_id)
            .select_related('question', 'answer')
            .order_by('-created_at')
        )
        serializer = LLMEvaluationLogSerializer(logs, many=True)
        return Response(serializer.data)