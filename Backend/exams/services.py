from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from exams.models import (
    AnswerStatus,
    ExamQuestion,
    ExamResult,
    QuestionType,
    ResultStatus,
    StudentAnswer,
)


class ResultService:
    @staticmethod
    def calculate_marks(answer: StudentAnswer) -> StudentAnswer:
        if answer.question.question_type == QuestionType.DESCRIPTIVE:
            raise ValueError('Use LLM or manual review for descriptive answers.')

        exam_question = ExamQuestion.objects.get(exam=answer.exam, question=answer.question)
        answer.marks_obtained = (
            exam_question.question_marks
            if answer.selected_option == answer.question.correct_option
            else Decimal('0')
        )
        answer.answer_status = AnswerStatus.CHECKED
        answer.evaluated_at = timezone.now()
        answer.save(update_fields=['marks_obtained', 'answer_status', 'evaluated_at'])
        return answer

    @staticmethod
    def apply_manual_review(answer: StudentAnswer, marks: Decimal, reviewer, feedback: str = '') -> StudentAnswer:
        exam_question = ExamQuestion.objects.get(exam=answer.exam, question=answer.question)
        if Decimal(marks) > exam_question.question_marks:
            raise ValueError(
                f'marks_obtained ({marks}) cannot exceed question_marks ({exam_question.question_marks}).'
            )

        answer.marks_obtained = marks
        answer.evaluated_by = reviewer
        answer.feedback = feedback
        answer.answer_status = AnswerStatus.CHECKED
        answer.evaluated_at = timezone.now()
        answer.confidence_score = None
        answer.save(
            update_fields=[
                'marks_obtained',
                'evaluated_by',
                'feedback',
                'answer_status',
                'evaluated_at',
                'confidence_score',
            ]
        )
        return answer

    @staticmethod
    @transaction.atomic
    def finalize_batch_results(exam):
        student_rows = (
            StudentAnswer.objects
            .filter(exam=exam, answer_status=AnswerStatus.CHECKED)
            .values('student')
            .annotate(total=Sum('marks_obtained'))
        )

        finalized = []
        for row in student_rows:
            total_obtained = row['total'] or Decimal('0')
            percentage = Decimal('0')
            if exam.total_marks:
                percentage = (total_obtained * Decimal('100')) / Decimal(exam.total_marks)

            result_status = ResultStatus.PASS if total_obtained >= exam.pass_marks else ResultStatus.FAIL
            grade = 'A+' if percentage >= 80 else 'A' if percentage >= 70 else 'B' if percentage >= 60 else 'C'

            result, _ = ExamResult.objects.update_or_create(
                exam=exam,
                student_id=row['student'],
                defaults={
                    'total_marks_obtained': total_obtained,
                    'total_marks': exam.total_marks,
                    'percentage': round(percentage, 2),
                    'grade': grade,
                    'result_status': result_status,
                },
            )
            finalized.append(result)
        return finalized

    @staticmethod
    def publish_batch_results(exam) -> int:
        return ExamResult.objects.filter(exam=exam, published_at__isnull=True).update(published_at=timezone.now())

    @staticmethod
    def get_batch_results(exam):
        return ExamResult.objects.filter(exam=exam).select_related('student').order_by('-total_marks_obtained')
