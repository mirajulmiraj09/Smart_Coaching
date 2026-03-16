from django.urls import path, include

urlpatterns = [
    path("auth/", include("rest_framework.urls")),
    path("", include("accounts.urls")),
    path("centers/", include("centers.urls")),
]
