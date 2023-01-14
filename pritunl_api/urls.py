from django.urls import path

from . import views

urlpatterns = [
    path(
        "organizations/", views.OrganizationListApi.as_view(), name="organizations-list"
    ),
    path(
        "organizations/create/",
        views.OrganizationCreateApi.as_view(),
        name="organizations-create",
    ),
    path(
        "organizations/<str:org_id>/",
        views.OrganizationDetailApi.as_view(),
        name="organizations-detail",
    ),
    path(
        "organizations/<str:org_id>/update/",
        views.OrganizationUpdateApi.as_view(),
        name="organizations-update",
    ),
    path(
        "organizations/<str:org_id>/delete/",
        views.OrganizationDeleteApi.as_view(),
        name="organizations-delete",
    ),
]
