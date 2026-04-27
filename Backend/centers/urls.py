# from django.urls import path
# from centers.views import (
#     CenterApplicationCreateView,
#     PendingCenterApplicationListView,
#     MyCenterApplicationListView,
#     CenterApplicationReviewView,
# )
# from centers.admin_views import (
#     AdminAllApplicationsListView,
#     AdminApplicationReviewView,
#     AdminApplicationDeleteView,
#     AdminAllCentersListView,
#     AdminCenterDetailView,
# )
# from centers.coaching_admin_views import (
#     MyCenterView,
#     CenterMemberListView,
#     AddTeacherView,
#     AddStudentView,
#     RemoveMemberView,
# )

# urlpatterns = [
#     # ── Applicant endpoints ─────────────────────────────────────────────────
#     path('applications/', CenterApplicationCreateView.as_view(), name='center-application-create'),
#     path('applications/my/', MyCenterApplicationListView.as_view(), name='my-center-application-list'),
#     path('applications/pending/', PendingCenterApplicationListView.as_view(), name='center-application-pending-list'),
#     path('applications/<int:coaching_center_id>/review/', CenterApplicationReviewView.as_view(), name='center-application-review'),

#     # ── System-admin endpoints ──────────────────────────────────────────────
#     path('admin/applications/', AdminAllApplicationsListView.as_view(), name='admin-all-applications'),
#     path('admin/applications/<int:coaching_center_id>/review/', AdminApplicationReviewView.as_view(), name='admin-application-review'),
#     path('admin/applications/<int:coaching_center_id>/', AdminApplicationDeleteView.as_view(), name='admin-application-delete'),
#     path('admin/', AdminAllCentersListView.as_view(), name='admin-all-centers'),
#     path('admin/<int:coaching_center_id>/', AdminCenterDetailView.as_view(), name='admin-center-detail'),

#     # ── Coaching Admin: manage own center ───────────────────────────────────
#     path('mine/', MyCenterView.as_view(), name='my-center'),
#     path('<int:center_id>/members/', CenterMemberListView.as_view(), name='center-members'),
#     path('<int:center_id>/members/add-teacher/', AddTeacherView.as_view(), name='center-add-teacher'),
#     path('<int:center_id>/members/add-student/', AddStudentView.as_view(), name='center-add-student'),
#     path('<int:center_id>/members/<int:user_id>/remove/', RemoveMemberView.as_view(), name='center-remove-member'),
# ]

"""
Updated centers/urls.py
Replace your existing backend/centers/urls.py with this file.
"""

from django.urls import path
from centers.views import (
    CenterApplicationCreateView,
    PendingCenterApplicationListView,
    MyCenterApplicationListView,
    CenterApplicationReviewView,
)
from centers.admin_views import (
    AdminAllApplicationsListView,
    AdminApplicationReviewView,
    AdminApplicationDeleteView,
    AdminAllCentersListView,
    AdminCenterDetailView,
)
# ── NEW: membership views ──────────────────────────────────────────────────────
from centers.center_member_views import (
    MyCoachingCenterView,
    CenterMemberListView,
    AddTeacherByEmailView,
    AddStudentByEmailView,
    RemoveMemberView,
)

urlpatterns = [
    # ── My center (for coaching admin dashboard) ─────────────────────────────
    path('mine/', MyCoachingCenterView.as_view(), name='my-coaching-center'),

    # ── Center membership ────────────────────────────────────────────────────
    # List all teachers + students of a center
    path('<int:center_id>/members/', CenterMemberListView.as_view(), name='center-member-list'),
    # Add teacher by email
    path('<int:center_id>/members/add-teacher/', AddTeacherByEmailView.as_view(), name='center-add-teacher'),
    # Add student by email
    path('<int:center_id>/members/add-student/', AddStudentByEmailView.as_view(), name='center-add-student'),
    # Remove a member
    path('<int:center_id>/members/<int:user_id>/remove/', RemoveMemberView.as_view(), name='center-remove-member'),

    # ── Coaching-admin applicant endpoints ───────────────────────────────────
    path('applications/', CenterApplicationCreateView.as_view(), name='center-application-create'),
    path('applications/my/', MyCenterApplicationListView.as_view(), name='my-center-application-list'),
    path('applications/pending/', PendingCenterApplicationListView.as_view(), name='center-application-pending-list'),
    path('applications/<int:coaching_center_id>/review/', CenterApplicationReviewView.as_view(), name='center-application-review'),

    # ── System-admin endpoints ───────────────────────────────────────────────
    path('admin/applications/', AdminAllApplicationsListView.as_view(), name='admin-all-applications'),
    path('admin/applications/<int:coaching_center_id>/review/', AdminApplicationReviewView.as_view(), name='admin-application-review'),
    path('admin/applications/<int:coaching_center_id>/', AdminApplicationDeleteView.as_view(), name='admin-application-delete'),
    path('admin/', AdminAllCentersListView.as_view(), name='admin-all-centers'),
    path('admin/<int:coaching_center_id>/', AdminCenterDetailView.as_view(), name='admin-center-detail'),
]
