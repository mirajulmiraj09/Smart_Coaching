# teaching/urls.py  (full updated)

from django.urls import path
from teaching.views import (
    BatchListCreateView,
    CourseListCreateView,
    MaterialDetailView,
    MaterialListCreateView,
    SubjectDetailView,
    SubjectListCreateView,
    TeacherAssignmentCreateView,
)
from teaching.teacher_views import (
    TeacherDashboardView,
    TeacherBatchStudentsView,
    TeacherQuestionListCreateView,
    TeacherQuestionDetailView,
    TeacherExamListCreateView,
    TeacherExamDetailView,
    TeacherExamStartView,
    TeacherExamEndView,
    TeacherExamResultsView,
    TeacherSubjectListView,
)

urlpatterns = [
    # ── Coaching-admin / general ───────────────────────────────────────────────
    path('centers/<int:center_id>/courses/',        CourseListCreateView.as_view(),        name='teaching-course-list-create'),
    path('courses/<int:course_id>/batches/',        BatchListCreateView.as_view(),         name='teaching-batch-list-create'),
    path('courses/<int:course_id>/subjects/',       SubjectListCreateView.as_view(),       name='teaching-subject-list-create'),
    path('subjects/<int:subject_id>/',              SubjectDetailView.as_view(),           name='teaching-subject-detail'),
    path('assignments/teachers/',                   TeacherAssignmentCreateView.as_view(), name='teaching-teacher-assignment-create'),
    path('subjects/<int:subject_id>/materials/',    MaterialListCreateView.as_view(),      name='teaching-material-list-create'),
    path('materials/<int:material_id>/',            MaterialDetailView.as_view(),          name='teaching-material-detail'),

    # ── Teacher: dashboard & subjects ─────────────────────────────────────────
    path('teacher/dashboard/',                      TeacherDashboardView.as_view(),        name='teacher-dashboard'),
    path('teacher/subjects/',                       TeacherSubjectListView.as_view(),      name='teacher-subjects'),
    path('teacher/batches/<int:batch_id>/students/',TeacherBatchStudentsView.as_view(),    name='teacher-batch-students'),

    # ── Teacher: question bank ────────────────────────────────────────────────
    path('teacher/questions/',                      TeacherQuestionListCreateView.as_view(), name='teacher-questions'),
    path('teacher/questions/<int:question_id>/',    TeacherQuestionDetailView.as_view(),     name='teacher-question-detail'),

    # ── Teacher: exams ────────────────────────────────────────────────────────
    path('teacher/exams/',                          TeacherExamListCreateView.as_view(),   name='teacher-exams'),
    path('teacher/exams/<int:exam_id>/',            TeacherExamDetailView.as_view(),       name='teacher-exam-detail'),
    path('teacher/exams/<int:exam_id>/start/',      TeacherExamStartView.as_view(),        name='teacher-exam-start'),
    path('teacher/exams/<int:exam_id>/end/',        TeacherExamEndView.as_view(),          name='teacher-exam-end'),
    path('teacher/exams/<int:exam_id>/results/',    TeacherExamResultsView.as_view(),      name='teacher-exam-results'),
]