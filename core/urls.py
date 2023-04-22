from django.contrib import admin
from django.urls import path, include

from accounts import views as acc_views

urlpatterns = [
    path("pritunl/", include("pritunl_manager.urls")),
    path("login/", acc_views.UserLoginView.as_view(), name="login-view"),
    path("logout/", acc_views.UserLogoutView.as_view(), name="logout-view"),
    path("admin/", admin.site.urls),
]
