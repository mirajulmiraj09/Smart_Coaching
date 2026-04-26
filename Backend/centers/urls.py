# from django.urls import path
# from centers.views import (
#     CenterApplicationCreateView,
#     PendingCenterApplicationListView,
#     AllCenterApplicationListView,
#     MyCenterApplicationListView,
#     CenterApplicationReviewView,
#     CenterApplicationDeleteView,
# )


# urlpatterns = [
#     path('applications/', CenterApplicationCreateView.as_view(), name='center-application-create'),
#     path('applications/my/', MyCenterApplicationListView.as_view(), name='my-center-application-list'),
#     path('applications/pending/', PendingCenterApplicationListView.as_view(), name='center-application-pending-list'),
#     path('applications/all/', AllCenterApplicationListView.as_view(), name='center-application-all-list'),
#     path('applications/<int:coaching_center_id>/review/', CenterApplicationReviewView.as_view(), name='center-application-review'),
#     path('applications/<int:coaching_center_id>/delete/', CenterApplicationDeleteView.as_view(), name='center-application-delete'),
# ]


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

urlpatterns = [
    # ── Coaching-admin applicant endpoints ──────────────────────────────────
    path('applications/', CenterApplicationCreateView.as_view(), name='center-application-create'),
    path('applications/my/', MyCenterApplicationListView.as_view(), name='my-center-application-list'),
    path('applications/pending/', PendingCenterApplicationListView.as_view(), name='center-application-pending-list'),
    path('applications/<int:coaching_center_id>/review/', CenterApplicationReviewView.as_view(), name='center-application-review'),

    # ── System-admin endpoints ───────────────────────────────────────────────
    # All applications (any status); filter: ?status=pending|approved|rejected
    path('admin/applications/', AdminAllApplicationsListView.as_view(), name='admin-all-applications'),
    # Approve / reject a specific application
    path('admin/applications/<int:coaching_center_id>/review/', AdminApplicationReviewView.as_view(), name='admin-application-review'),
    # Delete an application
    path('admin/applications/<int:coaching_center_id>/', AdminApplicationDeleteView.as_view(), name='admin-application-delete'),

    # All coaching centers list
    path('admin/', AdminAllCentersListView.as_view(), name='admin-all-centers'),
    # Single center detail + delete
    path('admin/<int:coaching_center_id>/', AdminCenterDetailView.as_view(), name='admin-center-detail'),
]
