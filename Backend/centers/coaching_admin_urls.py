"""
Coaching Admin URL patterns
File location: backend/centers/coaching_admin_urls.py

Include this in your main urls.py:
  path('api/v1/coaching/', include('centers.coaching_admin_urls')),
"""

from django.urls import path
from centers.coaching_admin_views import (
    CoachingAdminDashboardView,
    CoachingTeacherListCreateView,
    CoachingTeacherDetailView,
    CoachingStudentListView,
    CoachingStudentDeleteView,
    CoachingEnrollStudentView,
    CoachingSubjectListView,
    CoachingAssignTeacherView,
    CoachingAssignmentDeleteView,
    CoachingBatchResultView,
    MyCoachingCenterView,
)

urlpatterns = [
    # Dashboard
    path("dashboard/", CoachingAdminDashboardView.as_view(), name="coaching-dashboard"),

    # Center info
    path("center/", MyCoachingCenterView.as_view(), name="coaching-my-center"),

    # Teachers
    path("teachers/", CoachingTeacherListCreateView.as_view(), name="coaching-teacher-list-create"),
    path("teachers/<int:user_id>/", CoachingTeacherDetailView.as_view(), name="coaching-teacher-delete"),

    # Students
    path("students/", CoachingStudentListView.as_view(), name="coaching-student-list"),
    path("students/enroll/", CoachingEnrollStudentView.as_view(), name="coaching-student-enroll"),
    path("students/<int:enrollment_id>/", CoachingStudentDeleteView.as_view(), name="coaching-student-delete"),

    # Subjects (for teacher assignment)
    path("courses/<int:course_id>/subjects/", CoachingSubjectListView.as_view(), name="coaching-subject-list"),

    # Teacher assignments
    path("assignments/", CoachingAssignTeacherView.as_view(), name="coaching-assign-teacher"),
    path("assignments/<int:assignment_id>/", CoachingAssignmentDeleteView.as_view(), name="coaching-assignment-delete"),

    # Results
    path("results/", CoachingBatchResultView.as_view(), name="coaching-results"),
]
