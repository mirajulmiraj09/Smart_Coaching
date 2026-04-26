# teaching/teacher_views.py
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response
from rest_framework.exceptions import PermissionDenied

from django.utils import timezone

from accounts.models import RoleName
from academics.models import Batch, Enrollment
from teaching.models import Subject, TeacherSubjectBatchAssignment, TeachingMaterial
from teaching.serializers import SubjectSerializer, BatchSerializer, TeachingMaterialSerializer
from exams.models import QuestionBank, Exam, ExamQuestion, ExamResult, StudentAnswer, ExamType, ExamStatus
from exams.serializers import ExamResultSerializer


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


def ensure_teacher(user):
    if user.role_name != RoleName.TEACHER:
        raise PermissionDenied('Only teachers can perform this action.')


# ── GET /teaching/teacher/dashboard/ ──────────────────────────────────────────
class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_teacher(request.user)
        teacher = request.user

        assignments = TeacherSubjectBatchAssignment.objects.filter(
            teacher=teacher, is_active=True
        ).select_related('subject', 'batch', 'course')

        subjects = Subject.objects.filter(teacher=teacher, is_active=True)
        batches = list({a.batch_id: a.batch for a in assignments}.values())

        total_students = Enrollment.objects.filter(
            batch__teacher_assignments__teacher=teacher,
            batch__teacher_assignments__is_active=True,
            enrollment_status='active',
        ).distinct().count()

        total_exams = Exam.objects.filter(host_teacher=teacher).count()
        total_questions = QuestionBank.objects.filter(created_by=teacher).count()

        return success_response(data={
            'total_subjects': subjects.count(),
            'total_batches': len(batches),
            'total_students': total_students,
            'total_exams': total_exams,
            'total_questions': total_questions,
            'assignments': [
                {
                    'assignment_id': a.assignment_id,
                    'subject_id': a.subject.subject_id,
                    'subject_name': a.subject.subject_name,
                    'subject_code': a.subject.subject_code,
                    'batch_id': a.batch.batch_id,
                    'batch_name': a.batch.batch_name,
                    'batch_type': a.batch.batch_type,
                    'batch_status': a.batch.status,
                    'course_title': a.course.course_title,
                    'enrolled_count': a.batch.enrolled_count,
                }
                for a in assignments
            ],
        }, message='Teacher dashboard loaded.')


# ── GET /teaching/teacher/batches/<batch_id>/students/ ────────────────────────
class TeacherBatchStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, batch_id):
        ensure_teacher(request.user)

        # Only teacher's own batch
        assigned = TeacherSubjectBatchAssignment.objects.filter(
            teacher=request.user, batch_id=batch_id, is_active=True
        ).exists()
        if not assigned:
            raise PermissionDenied('You are not assigned to this batch.')

        enrollments = Enrollment.objects.filter(
            batch_id=batch_id, enrollment_status='active'
        ).select_related('student')

        students = []
        for e in enrollments:
            s = e.student
            exams_taken = StudentAnswer.objects.filter(
                student=s, exam__batch_id=batch_id
            ).values('exam').distinct().count()

            exams_total = Exam.objects.filter(
                batch_id=batch_id, host_teacher=request.user
            ).count()

            students.append({
                'user_id': s.user_id,
                'name': s.name,
                'email': s.email,
                'phone': s.phone,
                'enrolled_at': e.enrolled_at,
                'exams_taken': exams_taken,
                'exams_total': exams_total,
            })

        return success_response(data={'students': students}, message='Students fetched.')


# ── QuestionBank CRUD ─────────────────────────────────────────────────────────
# GET/POST /teaching/teacher/questions/
class TeacherQuestionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_teacher(request.user)
        subject_id = request.query_params.get('subject_id')
        question_type = request.query_params.get('type')

        qs = QuestionBank.objects.filter(created_by=request.user).order_by('-created_at')
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if question_type:
            qs = qs.filter(question_type=question_type)

        data = [
            {
                'question_id': q.question_id,
                'subject_id': q.subject_id,
                'subject_name': q.subject.subject_name,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'difficulty': q.difficulty,
                'max_marks': q.max_marks,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'correct_option': q.correct_option,
                'expected_answer': q.expected_answer,
                'created_at': q.created_at,
            }
            for q in qs.select_related('subject')
        ]
        return success_response(data={'results': data}, message='Questions fetched.')

    def post(self, request):
        ensure_teacher(request.user)
        d = request.data

        subject_id = d.get('subject_id')
        if not subject_id:
            return Response({'success': False, 'message': 'subject_id required.'}, status=400)

        subject = Subject.objects.filter(subject_id=subject_id, teacher=request.user).first()
        if not subject:
            raise PermissionDenied('You are not the assigned teacher for this subject.')

        q = QuestionBank.objects.create(
            subject=subject,
            question_text=d['question_text'],
            question_type=d['question_type'],
            difficulty=d.get('difficulty', 'medium'),
            max_marks=d.get('max_marks', 1),
            source='manual',
            created_by=request.user,
            option_a=d.get('option_a', ''),
            option_b=d.get('option_b', ''),
            option_c=d.get('option_c', ''),
            option_d=d.get('option_d', ''),
            correct_option=d.get('correct_option', ''),
            expected_answer=d.get('expected_answer', ''),
        )
        return success_response(data={'question_id': q.question_id}, message='Question created.', status_code=201)


# DELETE /teaching/teacher/questions/<question_id>/
class TeacherQuestionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, question_id):
        ensure_teacher(request.user)
        q = QuestionBank.objects.filter(question_id=question_id, created_by=request.user).first()
        if not q:
            return Response({'success': False, 'message': 'Not found.'}, status=404)
        q.delete()
        return success_response(message='Question deleted.')


# ── Exam CRUD ─────────────────────────────────────────────────────────────────
# GET/POST /teaching/teacher/exams/
class TeacherExamListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_teacher(request.user)
        exams = Exam.objects.filter(host_teacher=request.user).select_related('subject', 'batch').order_by('-created_at')
        data = [
            {
                'exam_id': e.exam_id,
                'title': e.title,
                'exam_type': e.exam_type,
                'subject_name': e.subject.subject_name,
                'batch_name': e.batch.batch_name,
                'status': e.status,
                'total_marks': str(e.total_marks),
                'pass_marks': str(e.pass_marks),
                'duration_minutes': e.duration_minutes,
                'start_time': e.start_time,
                'end_time': e.end_time,
                'access_code': e.access_code,
                'question_count': e.exam_slots.count(),
                'created_at': e.created_at,
            }
            for e in exams
        ]
        return success_response(data={'results': data}, message='Exams fetched.')

    def post(self, request):
        ensure_teacher(request.user)
        d = request.data

        subject = Subject.objects.filter(subject_id=d.get('subject_id'), teacher=request.user).first()
        if not subject:
            raise PermissionDenied('You are not assigned to this subject.')

        import secrets
        exam = Exam.objects.create(
            subject=subject,
            batch_id=d['batch_id'],
            exam_type=d.get('exam_type', ExamType.REGULAR),
            host_teacher=request.user,
            title=d['title'],
            total_marks=d.get('total_marks', 0),
            pass_marks=d.get('pass_marks', 0),
            duration_minutes=d.get('duration_minutes', 60),
            start_time=d.get('start_time'),
            end_time=d.get('end_time'),
            access_code=secrets.token_hex(4).upper() if d.get('exam_type') == ExamType.LIVE_QUIZ else '',
        )

        # Add questions
        question_ids = d.get('question_ids', [])
        for i, qid in enumerate(question_ids, 1):
            q = QuestionBank.objects.filter(question_id=qid, created_by=request.user).first()
            if q:
                ExamQuestion.objects.create(exam=exam, question=q, question_order=i, question_marks=q.max_marks)

        return success_response(data={'exam_id': exam.exam_id, 'access_code': exam.access_code},
                                message='Exam created.', status_code=201)


# POST /teaching/teacher/exams/<exam_id>/start/
class TeacherExamStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        ensure_teacher(request.user)
        exam = Exam.objects.filter(exam_id=exam_id, host_teacher=request.user).first()
        if not exam:
            return Response({'success': False, 'message': 'Exam not found.'}, status=404)
        exam.status = ExamStatus.ONGOING
        exam.start_time = timezone.now()
        exam.save(update_fields=['status', 'start_time'])
        return success_response(message='Exam started.')


# POST /teaching/teacher/exams/<exam_id>/end/
class TeacherExamEndView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        ensure_teacher(request.user)
        exam = Exam.objects.filter(exam_id=exam_id, host_teacher=request.user).first()
        if not exam:
            return Response({'success': False, 'message': 'Exam not found.'}, status=404)
        exam.status = ExamStatus.COMPLETED
        exam.end_time = timezone.now()
        exam.save(update_fields=['status', 'end_time'])
        return success_response(message='Exam ended.')