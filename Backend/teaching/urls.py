# from django.urls import path

# from teaching.views import (
#     BatchListCreateView,
#     CourseListCreateView,
#     MaterialDetailView,
#     MaterialListCreateView,
#     SubjectDetailView,
#     SubjectListCreateView,
#     TeacherAssignmentCreateView,
# )

# urlpatterns = [
#     path('centers/<int:center_id>/courses/', CourseListCreateView.as_view(), name='teaching-course-list-create'),
#     path('courses/<int:course_id>/batches/', BatchListCreateView.as_view(), name='teaching-batch-list-create'),
#     path('courses/<int:course_id>/subjects/', SubjectListCreateView.as_view(), name='teaching-subject-list-create'),
#     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='teaching-subject-detail'),
#     path('assignments/teachers/', TeacherAssignmentCreateView.as_view(), name='teaching-teacher-assignment-create'),
#     path('subjects/<int:subject_id>/materials/', MaterialListCreateView.as_view(), name='teaching-material-list-create'),
#     path('materials/<int:material_id>/', MaterialDetailView.as_view(), name='teaching-material-detail'),
# ]


from django.urls import path

from teaching.views import (
    BatchListCreateView,
    CourseListCreateView,
    MaterialDetailView,
    MaterialListCreateView,
    SubjectDetailView,
    SubjectListCreateView,
    TeacherAssignmentCreateView,
    TeacherAssignmentListView,
)

urlpatterns = [
    path('centers/<int:center_id>/courses/', CourseListCreateView.as_view(), name='teaching-course-list-create'),
    path('courses/<int:course_id>/batches/', BatchListCreateView.as_view(), name='teaching-batch-list-create'),
    path('courses/<int:course_id>/subjects/', SubjectListCreateView.as_view(), name='teaching-subject-list-create'),
    path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='teaching-subject-detail'),
    path('assignments/teachers/', TeacherAssignmentCreateView.as_view(), name='teaching-teacher-assignment-create'),
    path('centers/<int:center_id>/assignments/', TeacherAssignmentListView.as_view(), name='teaching-teacher-assignment-list'),
    path('subjects/<int:subject_id>/materials/', MaterialListCreateView.as_view(), name='teaching-material-list-create'),
    path('materials/<int:material_id>/', MaterialDetailView.as_view(), name='teaching-material-detail'),
]
