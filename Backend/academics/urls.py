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
from academics.student_views import (
    StudentDashboardView,
    StudentEnrollmentsView,
    StudentExamsView,
    StudentResultsView,
    StudentNotificationsView,
    StudentMarkReadView,
    StudentMarkAllReadView,
    StudentCenterListView,
    StudentCenterCoursesView,
    StudentCourseBatchesView,
    StudentSelfEnrollView,
)

urlpatterns = [
    # ── Staff / Admin endpoints ─────────────────────────────────────────────
    path('centers/<int:center_id>/courses/', CourseListCreateView.as_view(), name='academic-course-list-create'),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='academic-course-detail'),
    path('courses/<int:course_id>/archive/', CourseArchiveView.as_view(), name='academic-course-archive'),
    path('courses/<int:course_id>/batches/', BatchListCreateView.as_view(), name='academic-batch-list-create'),
    path('centers/<int:center_id>/batches/active/', ActiveBatchListView.as_view(), name='academic-active-batches'),
    path('batches/<int:batch_id>/enroll/', EnrollStudentView.as_view(), name='academic-enroll-student'),
    path('enrollments/<int:enrollment_id>/remove/', RemoveStudentView.as_view(), name='academic-remove-student'),
    path('batches/<int:batch_id>/students/', EnrolledStudentListView.as_view(), name='academic-enrolled-student-list'),

    # ── Student self-service endpoints ──────────────────────────────────────
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('student/enrollments/', StudentEnrollmentsView.as_view(), name='student-enrollments'),
    path('student/exams/', StudentExamsView.as_view(), name='student-exams'),
    path('student/results/', StudentResultsView.as_view(), name='student-results'),
    path('student/notifications/', StudentNotificationsView.as_view(), name='student-notifications'),
    path('student/notifications/read-all/', StudentMarkAllReadView.as_view(), name='student-notif-read-all'),
    path('student/notifications/<int:notification_id>/read/', StudentMarkReadView.as_view(), name='student-notif-read'),
    path('student/centers/', StudentCenterListView.as_view(), name='student-center-list'),
    path('student/centers/<int:center_id>/courses/', StudentCenterCoursesView.as_view(), name='student-center-courses'),
    path('student/courses/<int:course_id>/batches/', StudentCourseBatchesView.as_view(), name='student-course-batches'),
    path('student/batches/<int:batch_id>/enroll/', StudentSelfEnrollView.as_view(), name='student-self-enroll'),
]


# from django.urls import path

# from academics.views import (
#     ActiveBatchListView,
#     BatchListCreateView,
#     CourseArchiveView,
#     CourseDetailView,
#     CourseListCreateView,
#     EnrolledStudentListView,
#     EnrollStudentView,
#     RemoveStudentView,
# )
# from academics.student_views import (
#     StudentDashboardView,
#     StudentCenterListView,
#     StudentCenterCoursesView,
#     StudentCourseBatchesView,
#     StudentEnrollView,
#     StudentEnrollmentListView,
#     StudentExamListView,
#     StudentResultListView,
#     StudentNotificationListView,
#     StudentNotificationReadView,
#     StudentNotificationReadAllView,
# )

# urlpatterns = [
#     # ── Admin / coaching-admin endpoints ────────────────────────────────────
#     path('centers/<int:center_id>/courses/',         CourseListCreateView.as_view(),    name='academic-course-list-create'),
#     path('courses/<int:course_id>/',                 CourseDetailView.as_view(),        name='academic-course-detail'),
#     path('courses/<int:course_id>/archive/',         CourseArchiveView.as_view(),       name='academic-course-archive'),
#     path('courses/<int:course_id>/batches/',         BatchListCreateView.as_view(),     name='academic-batch-list-create'),
#     path('centers/<int:center_id>/batches/active/',  ActiveBatchListView.as_view(),     name='academic-active-batches'),
#     path('batches/<int:batch_id>/enroll/',           EnrollStudentView.as_view(),       name='academic-enroll-student'),
#     path('enrollments/<int:enrollment_id>/remove/',  RemoveStudentView.as_view(),       name='academic-remove-student'),
#     path('batches/<int:batch_id>/students/',         EnrolledStudentListView.as_view(), name='academic-enrolled-student-list'),

#     # ── Student-facing endpoints ─────────────────────────────────────────────
#     path('student/dashboard/',                                   StudentDashboardView.as_view(),           name='student-dashboard'),
#     path('student/centers/',                                     StudentCenterListView.as_view(),          name='student-center-list'),
#     path('student/centers/<int:center_id>/courses/',             StudentCenterCoursesView.as_view(),       name='student-center-courses'),
#     path('student/courses/<int:course_id>/batches/',             StudentCourseBatchesView.as_view(),       name='student-course-batches'),
#     path('student/batches/<int:batch_id>/enroll/',               StudentEnrollView.as_view(),              name='student-enroll'),
#     path('student/enrollments/',                                 StudentEnrollmentListView.as_view(),      name='student-enrollments'),
#     path('student/exams/',                                       StudentExamListView.as_view(),            name='student-exams'),
#     path('student/results/',                                     StudentResultListView.as_view(),          name='student-results'),
#     path('student/notifications/',                               StudentNotificationListView.as_view(),    name='student-notifications'),
#     path('student/notifications/read-all/',                      StudentNotificationReadAllView.as_view(), name='student-notifications-read-all'),
#     path('student/notifications/<int:notification_id>/read/',    StudentNotificationReadView.as_view(),    name='student-notification-read'),
# ]