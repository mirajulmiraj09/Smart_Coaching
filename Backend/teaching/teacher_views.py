# teaching/teacher_views.py  (complete final version)

import secrets

from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView, Response

from accounts.models import RoleName
from academics.models import Batch, Enrollment
from exams.models import (
    Exam, ExamQuestion, ExamResult, ExamStatus, ExamType,
    QuestionBank, StudentAnswer,
)
from teaching.models import Subject, TeacherSubjectBatchAssignment


def success_response(data=None, message='Success', status_code=status.HTTP_200_OK):
    return Response(
        {'success': True, 'message': message, 'data': data or {}},
        status=status_code,
    )


def ensure_teacher(user):
    if user.role_name != RoleName.TEACHER:
        raise PermissionDenied('Only teachers can perform this action.')


def is_assigned_to_subject(teacher, subject_id):
    """
    Teacher assigned কিনা দুটো উপায়ে check:
      1. Subject.teacher == teacher  (direct)
      2. TeacherSubjectBatchAssignment এ record  (coaching admin assign করেছে)
    """
    direct = Subject.objects.filter(
        subject_id=subject_id,
        teacher=teacher,
        is_active=True,
    ).exists()
    via_assignment = TeacherSubjectBatchAssignment.objects.filter(
        subject_id=subject_id,
        teacher=teacher,
        is_active=True,
    ).exists()
    return direct or via_assignment


def _assignment_to_dict(a):
    """TeacherSubjectBatchAssignment → dict (dashboard এ use হয়)."""
    return {
        'assignment_id':  a.assignment_id,
        'subject_id':     a.subject.subject_id,
        'subject_name':   a.subject.subject_name,
        'subject_code':   a.subject.subject_code,
        'batch_id':       a.batch.batch_id,
        'batch_name':     a.batch.batch_name,
        'batch_type':     a.batch.batch_type,
        'batch_status':   a.batch.status,
        'course_id':      a.course.course_id,
        'course_title':   a.course.course_title,
        'enrolled_count': a.batch.enrolled_count,
        'center_name':    a.coaching_center.center_name if a.coaching_center_id else None,
        'center_id':      a.coaching_center_id,
    }


# ── GET /teaching/teacher/dashboard/ ──────────────────────────────────────────
class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_teacher(request.user)
        teacher = request.user

        assignments = (
            TeacherSubjectBatchAssignment.objects
            .filter(teacher=teacher, is_active=True)
            .select_related('subject', 'batch', 'course', 'coaching_center')
            .order_by('course__course_title', 'subject__subject_name')
        )

        # unique subject ids (from assignment + direct)
        assigned_ids = {a.subject_id for a in assignments}
        direct_subjects = Subject.objects.filter(teacher=teacher, is_active=True)
        all_subject_ids = assigned_ids | {s.subject_id for s in direct_subjects}

        # unique batches from assignments
        unique_batch_ids = {a.batch_id for a in assignments}

        total_students = (
            Enrollment.objects
            .filter(
                batch_id__in=unique_batch_ids,
                enrollment_status='active',
            )
            .distinct()
            .count()
        )

        total_exams     = Exam.objects.filter(host_teacher=teacher).count()
        total_questions = QuestionBank.objects.filter(created_by=teacher).count()

        # ─── Get teacher's coaching centers + courses ────────────────────────
        from centers.models import CenterMembership
        from academics.models import Course

        my_centers = []
        memberships = (
            CenterMembership.objects
            .filter(user=teacher, role=CenterMembership.Role.TEACHER)
            .select_related('coaching_center')
        )
        
        for membership in memberships:
            center = membership.coaching_center
            courses = (
                Course.objects
                .filter(coaching_center=center, is_archived=False)
                .values('course_id', 'course_title')
                .order_by('course_title')
            )
            my_centers.append({
                'center_id': center.coaching_center_id,
                'center_name': center.center_name,
                'courses': list(courses),
            })

        return success_response(
            data={
                'total_subjects':   len(all_subject_ids),
                'total_batches':    len(unique_batch_ids),
                'total_students':   total_students,
                'total_exams':      total_exams,
                'total_questions':  total_questions,
                'assignments':      [_assignment_to_dict(a) for a in assignments],
                'my_centers':       my_centers,
            },
            message='Teacher dashboard loaded.',
        )


# ── GET /teaching/teacher/batches/<batch_id>/students/ ────────────────────────
class TeacherBatchStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, batch_id):
        ensure_teacher(request.user)

        if not TeacherSubjectBatchAssignment.objects.filter(
            teacher=request.user, batch_id=batch_id, is_active=True
        ).exists():
            raise PermissionDenied('You are not assigned to this batch.')

        enrollments = (
            Enrollment.objects
            .filter(batch_id=batch_id, enrollment_status='active')
            .select_related('student')
        )

        students = []
        for e in enrollments:
            s = e.student
            exams_taken = (
                StudentAnswer.objects
                .filter(student=s, exam__batch_id=batch_id)
                .values('exam')
                .distinct()
                .count()
            )
            exams_total = Exam.objects.filter(
                batch_id=batch_id, host_teacher=request.user
            ).count()

            students.append({
                'user_id':     s.user_id,
                'name':        s.name,
                'email':       s.email,
                'phone':       s.phone,
                'enrolled_at': e.enrolled_at,
                'exams_taken': exams_taken,
                'exams_total': exams_total,
            })

        return success_response(
            data={'students': students},
            message='Students fetched.',
        )


# ── GET /teaching/teacher/subjects/ ───────────────────────────────────────────
class TeacherSubjectListView(APIView):
    """Teacher এর সব assigned subjects (assignment + direct), center+course info সহ।"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_teacher(request.user)

        assignments = (
            TeacherSubjectBatchAssignment.objects
            .filter(teacher=request.user, is_active=True)
            .select_related('subject', 'batch', 'course', 'coaching_center')
        )

        seen = {}
        for a in assignments:
            sid = a.subject_id
            if sid not in seen:
                seen[sid] = {
                    'subject_id':   a.subject.subject_id,
                    'subject_name': a.subject.subject_name,
                    'subject_code': a.subject.subject_code,
                    'course_title': a.course.course_title,
                    'center_name':  a.coaching_center.center_name if a.coaching_center_id else None,
                    'batches':      [],
                }
            seen[sid]['batches'].append({
                'batch_id':   a.batch.batch_id,
                'batch_name': a.batch.batch_name,
                'batch_type': a.batch.batch_type,
                'status':     a.batch.status,
            })

        # direct Subject.teacher assignments (no batch info)
        direct = Subject.objects.filter(
            teacher=request.user, is_active=True
        ).select_related('course', 'coaching_center')

        for s in direct:
            if s.subject_id not in seen:
                seen[s.subject_id] = {
                    'subject_id':   s.subject_id,
                    'subject_name': s.subject_name,
                    'subject_code': s.subject_code,
                    'course_title': s.course.course_title if s.course_id else None,
                    'center_name':  s.coaching_center.center_name if s.coaching_center_id else None,
                    'batches':      [],
                }

        data = list(seen.values())
        return success_response(
            data={'results': data, 'total': len(data)},
            message='Subjects fetched.',
        )


# ── QuestionBank  GET+POST /teaching/teacher/questions/ ───────────────────────
class TeacherQuestionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_teacher(request.user)
        subject_id    = request.query_params.get('subject_id')
        question_type = request.query_params.get('type')

        qs = (
            QuestionBank.objects
            .filter(created_by=request.user)
            .select_related('subject')
            .order_by('-created_at')
        )
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if question_type:
            qs = qs.filter(question_type=question_type)

        data = [
            {
                'question_id':    q.question_id,
                'subject_id':     q.subject_id,
                'subject_name':   q.subject.subject_name,
                'question_text':  q.question_text,
                'question_type':  q.question_type,
                'difficulty':     q.difficulty,
                'max_marks':      q.max_marks,
                'source':         q.source,
                'option_a':       q.option_a,
                'option_b':       q.option_b,
                'option_c':       q.option_c,
                'option_d':       q.option_d,
                'correct_option': q.correct_option,
                'expected_answer':q.expected_answer,
                'created_at':     q.created_at,
            }
            for q in qs
        ]
        return success_response(data={'results': data}, message='Questions fetched.')

    def post(self, request):
        ensure_teacher(request.user)
        d = request.data

        subject_id = d.get('subject_id')
        if not subject_id:
            return Response(
                {'success': False, 'message': 'subject_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not is_assigned_to_subject(request.user, subject_id):
            raise PermissionDenied(
                'You are not assigned to this subject. '
                'Ask your coaching admin to assign you.'
            )

        question_text = str(d.get('question_text', '')).strip()
        question_type = str(d.get('question_type', '')).strip()

        if not question_text:
            return Response(
                {'success': False, 'message': 'question_text is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if question_type not in ('mcq', 'true_false', 'descriptive'):
            return Response(
                {'success': False, 'message': 'question_type must be mcq, true_false, or descriptive.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = Subject.objects.get(subject_id=subject_id)
        q = QuestionBank.objects.create(
            subject=subject,
            question_text=question_text,
            question_type=question_type,
            difficulty=d.get('difficulty', 'medium'),
            max_marks=d.get('max_marks', 1),
            source=d.get('source', 'manual'),
            created_by=request.user,
            option_a=d.get('option_a', ''),
            option_b=d.get('option_b', ''),
            option_c=d.get('option_c', ''),
            option_d=d.get('option_d', ''),
            correct_option=d.get('correct_option', ''),
            expected_answer=d.get('expected_answer', ''),
        )
        return success_response(
            data={
                'question_id':   q.question_id,
                'subject_name':  q.subject.subject_name,
                'question_text': q.question_text,
                'question_type': q.question_type,
                'difficulty':    q.difficulty,
                'max_marks':     q.max_marks,
            },
            message='Question created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


# ── GET+PATCH+DELETE /teaching/teacher/questions/<question_id>/ ───────────────
class TeacherQuestionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_q(self, request, qid):
        q = (
            QuestionBank.objects
            .filter(question_id=qid, created_by=request.user)
            .select_related('subject')
            .first()
        )
        if not q:
            raise NotFound('Question not found.')
        return q

    def get(self, request, question_id):
        ensure_teacher(request.user)
        q = self._get_q(request, question_id)
        return success_response(data={
            'question_id':    q.question_id,
            'subject_id':     q.subject_id,
            'subject_name':   q.subject.subject_name,
            'question_text':  q.question_text,
            'question_type':  q.question_type,
            'difficulty':     q.difficulty,
            'max_marks':      q.max_marks,
            'source':         q.source,
            'option_a':       q.option_a,
            'option_b':       q.option_b,
            'option_c':       q.option_c,
            'option_d':       q.option_d,
            'correct_option': q.correct_option,
            'expected_answer':q.expected_answer,
        })

    def patch(self, request, question_id):
        ensure_teacher(request.user)
        q = self._get_q(request, question_id)
        for field in ('question_text','question_type','difficulty','max_marks',
                      'option_a','option_b','option_c','option_d',
                      'correct_option','expected_answer'):
            if field in request.data:
                setattr(q, field, request.data[field])
        q.save()
        return success_response(message='Question updated.')

    def delete(self, request, question_id):
        ensure_teacher(request.user)
        q = self._get_q(request, question_id)
        q.delete()
        return success_response(message='Question deleted.')


# ── Exams  GET+POST /teaching/teacher/exams/ ──────────────────────────────────
class TeacherExamListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_teacher(request.user)
        exams = (
            Exam.objects
            .filter(host_teacher=request.user)
            .select_related('subject', 'batch')
            .order_by('-created_at')
        )
        data = [
            {
                'exam_id':          e.exam_id,
                'title':            e.title,
                'exam_type':        e.exam_type,
                'subject_id':       e.subject_id,
                'subject_name':     e.subject.subject_name,
                'batch_id':         e.batch_id,
                'batch_name':       e.batch.batch_name,
                'status':           e.status,
                'total_marks':      str(e.total_marks),
                'pass_marks':       str(e.pass_marks),
                'duration_minutes': e.duration_minutes,
                'start_time':       e.start_time,
                'end_time':         e.end_time,
                'access_code':      e.access_code,
                'question_count':   e.exam_slots.count(),
                'created_at':       e.created_at,
            }
            for e in exams
        ]
        return success_response(data={'results': data}, message='Exams fetched.')

    def post(self, request):
        ensure_teacher(request.user)
        d = request.data

        subject_id = d.get('subject_id')
        batch_id   = d.get('batch_id')
        title      = str(d.get('title', '')).strip()

        if not subject_id:
            return Response({'success': False, 'message': 'subject_id required.'}, status=400)
        if not batch_id:
            return Response({'success': False, 'message': 'batch_id required.'}, status=400)
        if not title:
            return Response({'success': False, 'message': 'title required.'}, status=400)

        if not is_assigned_to_subject(request.user, subject_id):
            raise PermissionDenied(
                'You are not assigned to this subject. '
                'Ask your coaching admin to assign you.'
            )

        subject   = Subject.objects.get(subject_id=subject_id)
        exam_type = d.get('exam_type', ExamType.REGULAR)

        exam = Exam.objects.create(
            subject=subject,
            batch_id=batch_id,
            exam_type=exam_type,
            host_teacher=request.user,
            title=title,
            total_marks=d.get('total_marks', 0),
            pass_marks=d.get('pass_marks', 0),
            duration_minutes=d.get('duration_minutes', 60),
            start_time=d.get('start_time') or None,
            end_time=d.get('end_time') or None,
            access_code=(
                secrets.token_hex(4).upper()
                if exam_type == ExamType.LIVE_QUIZ
                else ''
            ),
        )

        question_ids = d.get('question_ids', [])
        for i, qid in enumerate(question_ids, 1):
            q = QuestionBank.objects.filter(question_id=qid, subject=subject).first()
            if q:
                ExamQuestion.objects.create(
                    exam=exam,
                    question=q,
                    question_order=i,
                    question_marks=q.max_marks,
                )

        return success_response(
            data={
                'exam_id':        exam.exam_id,
                'access_code':    exam.access_code,
                'title':          exam.title,
                'question_count': len(question_ids),
            },
            message='Exam created successfully.',
            status_code=status.HTTP_201_CREATED,
        )


# ── GET /teaching/teacher/exams/<exam_id>/ ────────────────────────────────────
class TeacherExamDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        ensure_teacher(request.user)
        exam = (
            Exam.objects
            .filter(exam_id=exam_id, host_teacher=request.user)
            .select_related('subject', 'batch')
            .first()
        )
        if not exam:
            raise NotFound('Exam not found.')

        questions = [
            {
                'exam_question_id': eq.exam_question_id,
                'question_id':      eq.question.question_id,
                'question_text':    eq.question.question_text,
                'question_type':    eq.question.question_type,
                'difficulty':       eq.question.difficulty,
                'question_marks':   str(eq.question_marks),
                'question_order':   eq.question_order,
                'option_a':         eq.question.option_a,
                'option_b':         eq.question.option_b,
                'option_c':         eq.question.option_c,
                'option_d':         eq.question.option_d,
                'correct_option':   eq.question.correct_option,
                'expected_answer':  eq.question.expected_answer,
            }
            for eq in (
                ExamQuestion.objects
                .filter(exam=exam)
                .select_related('question')
                .order_by('question_order')
            )
        ]

        return success_response(data={
            'exam_id':          exam.exam_id,
            'title':            exam.title,
            'exam_type':        exam.exam_type,
            'subject_name':     exam.subject.subject_name,
            'batch_name':       exam.batch.batch_name,
            'status':           exam.status,
            'total_marks':      str(exam.total_marks),
            'pass_marks':       str(exam.pass_marks),
            'duration_minutes': exam.duration_minutes,
            'start_time':       exam.start_time,
            'end_time':         exam.end_time,
            'access_code':      exam.access_code,
            'questions':        questions,
        })


# ── POST /teaching/teacher/exams/<exam_id>/start/ ────────────────────────────
class TeacherExamStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        ensure_teacher(request.user)
        exam = Exam.objects.filter(exam_id=exam_id, host_teacher=request.user).first()
        if not exam:
            raise NotFound('Exam not found.')
        if exam.status == ExamStatus.COMPLETED:
            return Response({'success': False, 'message': 'Exam already completed.'}, status=400)
        exam.status     = ExamStatus.ONGOING
        exam.start_time = timezone.now()
        exam.save(update_fields=['status', 'start_time'])
        return success_response(message='Exam started.')


# ── POST /teaching/teacher/exams/<exam_id>/end/ ───────────────────────────────
class TeacherExamEndView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, exam_id):
        ensure_teacher(request.user)
        exam = Exam.objects.filter(exam_id=exam_id, host_teacher=request.user).first()
        if not exam:
            raise NotFound('Exam not found.')
        if exam.status == ExamStatus.COMPLETED:
            return Response({'success': False, 'message': 'Exam already completed.'}, status=400)
        exam.status   = ExamStatus.COMPLETED
        exam.end_time = timezone.now()
        exam.save(update_fields=['status', 'end_time'])
        return success_response(message='Exam ended.')


# ── GET /teaching/teacher/exams/<exam_id>/results/ ────────────────────────────
class TeacherExamResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, exam_id):
        ensure_teacher(request.user)
        exam = Exam.objects.filter(exam_id=exam_id, host_teacher=request.user).first()
        if not exam:
            raise NotFound('Exam not found.')

        results = ExamResult.objects.filter(exam=exam).select_related('student')
        data = [
            {
                'result_id':             r.result_id,
                'student_id':            r.student.user_id,
                'student_name':          r.student.name,
                'student_email':         r.student.email,
                'total_marks_obtained':  str(r.total_marks_obtained),
                'total_marks':           str(r.total_marks),
                'percentage':            str(r.percentage),
                'grade':                 r.grade,
                'result_status':         r.result_status,
                'is_published':          r.published_at is not None,
            }
            for r in results
        ]
        return success_response(data={'results': data, 'total': len(data)})