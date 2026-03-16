from django.urls import path
from centers.views import (
    CenterApplicationCreateView,
    PendingCenterApplicationListView,
    MyCenterApplicationListView,
    CenterApplicationReviewView,
)


urlpatterns = [
    path('applications/', CenterApplicationCreateView.as_view(), name='center-application-create'),
    path('applications/my/', MyCenterApplicationListView.as_view(), name='my-center-application-list'),
    path('applications/pending/', PendingCenterApplicationListView.as_view(), name='center-application-pending-list'),
    path('applications/<int:coaching_center_id>/review/', CenterApplicationReviewView.as_view(), name='center-application-review'),
]
