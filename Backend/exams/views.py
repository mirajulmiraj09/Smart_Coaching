from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response

from exams.models import Exam, ExamResult, StudentAnswer
from exams.serializers import (
    ExamResultSerializer,
    ManualReviewSerializer,
    StudentAnswerDetailSerializer,
)
from exams.services import ResultService


class ManualReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        serializer = ManualReviewSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        reviewed = []
        errors = []
        for item in serializer.validated_data:
            try:
                answer = StudentAnswer.objects.select_related('question', 'exam').get(
                    pk=item['answer_id'],
                    exam_id=exam_id,
                )
                ResultService.apply_manual_review(
                    answer=answer,
                    marks=item['marks_obtained'],
                    reviewer=request.user,
                    feedback=item.get('feedback', ''),
                )
                reviewed.append(item['answer_id'])
            except StudentAnswer.DoesNotExist:
                errors.append({'answer_id': item['answer_id'], 'error': 'Not found.'})
            except ValueError as exc:
                errors.append({'answer_id': item['answer_id'], 'error': str(exc)})

        return Response({'reviewed': reviewed, 'errors': errors}, status=status.HTTP_200_OK)


class FinalizeResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        exam = Exam.objects.get(pk=exam_id)
        finalized = ResultService.finalize_batch_results(exam)
        return Response({'detail': f'{len(finalized)} result(s) finalized.'}, status=status.HTTP_200_OK)


class PublishResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        exam = Exam.objects.get(pk=exam_id)
        count = ResultService.publish_batch_results(exam)
        return Response({'detail': f'{count} result(s) published.'}, status=status.HTTP_200_OK)


class BatchResultListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        exam = Exam.objects.get(pk=exam_id)
        if request.user.role_name in ('teacher', 'coaching_admin', 'coaching_manager'):
            results = ResultService.get_batch_results(exam)
        else:
            results = ExamResult.objects.filter(exam=exam, student=request.user, published_at__isnull=False)

        serializer = ExamResultSerializer(results, many=True)
        return Response(serializer.data)


class AnswerReviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        student_id = request.query_params.get('student_id', request.user.pk)
        answers = (
            StudentAnswer.objects
            .filter(exam_id=exam_id, student_id=student_id)
            .select_related('question', 'evaluated_by')
            .order_by('question__question_id')
        )
        serializer = StudentAnswerDetailSerializer(answers, many=True)
        return Response(serializer.data)
