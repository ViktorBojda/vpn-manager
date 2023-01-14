from django.urls import include, path

from pritunl_api import views


user_patterns = [
    path("", views.UserListApi.as_view(), name="users-list"),
    path(
        "create/",
        views.UserCreateApi.as_view(),
        name="users-create",
    ),
    path(
        "<str:user_id>/",
        views.UserDetailApi.as_view(),
        name="users-detail",
    ),
    path(
        "<str:user_id>/update/",
        views.UserUpdateApi.as_view(),
        name="users-update",
    ),
    path(
        "<str:user_id>/delete/",
        views.UserDeleteApi.as_view(),
        name="users-delete",
    ),
]

organization_patterns = [
    path("", views.OrganizationListApi.as_view(), name="organizations-list"),
    path(
        "create/",
        views.OrganizationCreateApi.as_view(),
        name="organizations-create",
    ),
    path(
        "<str:org_id>/",
        views.OrganizationDetailApi.as_view(),
        name="organizations-detail",
    ),
    path(
        "<str:org_id>/update/",
        views.OrganizationUpdateApi.as_view(),
        name="organizations-update",
    ),
    path(
        "<str:org_id>/delete/",
        views.OrganizationDeleteApi.as_view(),
        name="organizations-delete",
    ),
    path("<str:org_id>/users/", include((user_patterns, "users"))),
]

urlpatterns = [
    path("organizations/", include((organization_patterns, "organizations"))),
]
