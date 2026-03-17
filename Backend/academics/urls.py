from django.urls import path

from academics.views import (
    ActiveBatchListView,
    BatchListCreateView,
    CourseArchiveView,
    CourseDetailView,
    CourseListCreateView,
    EnrolledStudentListView,
    EnrollStudentView,
    RemoveStudentView,
)

urlpatterns = [
    path('centers/<int:center_id>/courses/', CourseListCreateView.as_view(), name='academic-course-list-create'),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='academic-course-detail'),
    path('courses/<int:course_id>/archive/', CourseArchiveView.as_view(), name='academic-course-archive'),
    path('courses/<int:course_id>/batches/', BatchListCreateView.as_view(), name='academic-batch-list-create'),
    path('centers/<int:center_id>/batches/active/', ActiveBatchListView.as_view(), name='academic-active-batches'),
    path('batches/<int:batch_id>/enroll/', EnrollStudentView.as_view(), name='academic-enroll-student'),
    path('enrollments/<int:enrollment_id>/remove/', RemoveStudentView.as_view(), name='academic-remove-student'),
    path('batches/<int:batch_id>/students/', EnrolledStudentListView.as_view(), name='academic-enrolled-student-list'),
]
