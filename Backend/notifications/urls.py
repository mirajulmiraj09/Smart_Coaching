from django.urls import path

from notifications.views import (
    BroadcastView,
    MarkAllReadView,
    MarkReadView,
    NotificationListView,
)

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/read/', MarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/read-all/', MarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('notifications/broadcast/', BroadcastView.as_view(), name='notification-broadcast'),
]
            