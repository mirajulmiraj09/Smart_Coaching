import json
import logging

import requests
from django.conf import settings
from django.utils import timezone

from exams.models import AnswerStatus, ExamQuestion, QuestionBank, QuestionSource, QuestionType, StudentAnswer
from ai_engine.models import LLMEvaluationLog

logger = logging.getLogger(__name__)

LLM_API_URL = getattr(settings, 'LLM_API_URL', 'http://localhost:11434/api/chat')
LLM_MODEL = getattr(settings, 'LLM_MODEL', 'llama3')


class LLMService:

    @staticmethod
    def _get_llm_user():
        """Return the reserved LLM system user (role='llm')."""
        from accounts.models import User, RoleName
        return User.objects.get(role__role_name=RoleName.LLM)

    @staticmethod
    def _call_api(prompt: str) -> dict:
        """
        Send a prompt to the LLM API and return parsed JSON response.
        Override LLM_API_URL and LLM_MODEL in settings for your provider.
        """
        payload = {
            'model': LLM_MODEL,
            'messages': [{'role': 'user', 'content': prompt}],
            'stream': False,
        }
        response = requests.post(LLM_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        content = response.json()['message']['content']

        # Strip markdown code fences if present
        content = content.strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        return json.loads(content.strip())

    # ------------------------------------------------------------------ #
    # Question Generation
    # ------------------------------------------------------------------ #

    @staticmethod
    def generate_questions(subject, materials: list, count: int = 5, difficulty: str = 'medium') -> list:
        """
        Generate questions from teaching materials for a subject.
        Returns a list of saved Question instances.
        """
        
        material_text = '\n\n'.join([
            f'--- {m.material_title} ---\n{m.file_path}'
            for m in materials
        ])

        prompt = f"""
You are an expert exam question generator.
Generate exactly {count} {difficulty} questions from the study material below.
Subject: {subject.subject_name}

Study Material:
{material_text}

Return ONLY a valid JSON array. Each object must have:
- "question_text": string
- "question_type": one of "mcq", "true_false", "descriptive"
- "difficulty": "{difficulty}"
- "max_marks": integer (1-10)
- "option_a", "option_b": always required
- "option_c", "option_d": required for mcq, null for true_false and descriptive
- "correct_option": "A" or "B" for true_false, "A"/"B"/"C"/"D" for mcq, null for descriptive
- "expected_answer": string for descriptive, null otherwise

No explanation. No markdown. Raw JSON array only.
""".strip()

        llm_user = LLMService._get_llm_user()
        raw = LLMService._call_api(prompt)

        created = []
        for item in raw:
            q = QuestionBank.objects.create(
                subject=subject,
                question_text=item['question_text'],
                question_type=item['question_type'],
                difficulty=item['difficulty'],
                max_marks=item['max_marks'],
                source=QuestionSource.LLM,
                created_by=llm_user,
                option_a=item.get('option_a'),
                option_b=item.get('option_b'),
                option_c=item.get('option_c'),
                option_d=item.get('option_d'),
                correct_option=item.get('correct_option'),
                expected_answer=item.get('expected_answer'),
            )
            created.append(q)

        logger.info(f'LLM generated {len(created)} questions for subject {subject.subject_id}')
        return created

    # ------------------------------------------------------------------ #
    # Descriptive Answer Evaluation
    # ------------------------------------------------------------------ #

    @staticmethod
    def evaluate_descriptive_answer(answer: StudentAnswer) -> StudentAnswer:
        """
        Evaluate a descriptive answer using LLM rubric scoring.
        Updates marks_obtained, confidence_score, feedback, and answer_status.
        Logs the evaluation in LLMEvaluationLog.
        """
        if answer.question.question_type != QuestionType.DESCRIPTIVE:
            raise ValueError('LLM evaluation is only for descriptive answers.')

        exam_question = ExamQuestion.objects.get(
            exam=answer.exam,
            question=answer.question
        )
        max_marks = float(exam_question.question_marks)
        expected = answer.question.expected_answer or 'No model answer provided.'

        prompt = f"""
You are an expert answer evaluator.
Evaluate the student's answer based on the rubric below.

Question: {answer.question.question_text}
Expected Answer / Model Answer: {expected}
Student's Answer: {answer.descriptive_answer}
Maximum Marks: {max_marks}

Return ONLY a valid JSON object with exactly these fields:
- "marks_obtained": float between 0 and {max_marks}
- "confidence_score": float between 0.00 and 1.00
- "feedback": string (2-4 sentences, constructive)
- "scoring_rubric": string (brief explanation of how you scored)

No explanation. No markdown. Raw JSON only.
""".strip()

        llm_user = LLMService._get_llm_user()
        result = LLMService._call_api(prompt)

        marks = min(float(result['marks_obtained']), max_marks)
        confidence = min(float(result['confidence_score']), 1.00)

        # Update the answer
        answer.marks_obtained = marks
        answer.confidence_score = confidence
        answer.feedback = result.get('feedback', '')
        answer.evaluated_by = llm_user
        answer.answer_status = AnswerStatus.CHECKED
        answer.evaluated_at = timezone.now()
        answer.save(update_fields=[
            'marks_obtained', 'confidence_score', 'feedback',
            'evaluated_by', 'answer_status', 'evaluated_at'
        ])

        # Log the evaluation
        LLMEvaluationLog.objects.create(
            question=answer.question,
            answer=answer,
            llm_user=llm_user,
            model_name=LLM_MODEL,
            scoring_rubric=result.get('scoring_rubric', ''),
            confidence_score=confidence,
            feedback=result.get('feedback', ''),
        )

        return answer

    @staticmethod
    def evaluate_all_descriptive(exam) -> dict:
        """
        Bulk-evaluate all pending descriptive answers for an exam.
        Returns {'evaluated': [...], 'failed': [...]}.
        """
        pending = StudentAnswer.objects.filter(
            exam=exam,
            answer_status=AnswerStatus.SUBMITTED,
            question__question_type=QuestionType.DESCRIPTIVE,
        ).select_related('question', 'exam')

        evaluated, failed = [], []
        for answer in pending:
            try:
                LLMService.evaluate_descriptive_answer(answer)
                evaluated.append(answer.answer_id)
            except Exception as e:
                logger.error(f'LLM eval failed for answer {answer.answer_id}: {e}')
                failed.append({'answer_id': answer.answer_id, 'error': str(e)})

        return {'evaluated': evaluated, 'failed': failed}