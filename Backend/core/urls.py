from django.urls import path, include

urlpatterns = [
    path("auth/", include("rest_framework.urls")),
    path("", include("accounts.urls")),
    path("centers/", include("centers.urls")),
    path("academics/", include("academics.urls")),
    path("teaching/", include("teaching.urls")),
    path("exams/", include("exams.urls")),
    path("ai/", include("ai_engine.urls")),
    # path("notifications/", include("notifications.urls")),
]
