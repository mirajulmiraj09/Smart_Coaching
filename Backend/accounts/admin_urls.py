from django.urls import path
from accounts.admin_views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUserActivateView,
    AdminUserDeactivateView,
)
# from accounts.views import AdminDashboardView

urlpatterns = [
    # path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<int:user_id>/activate/", AdminUserActivateView.as_view(), name="admin-user-activate"),
    path("users/<int:user_id>/deactivate/", AdminUserDeactivateView.as_view(), name="admin-user-deactivate"),
]