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

route_patterns = [
    path("", views.RouteListApi.as_view(), name="routes-list"),
    path(
        "create/",
        views.RouteCreateApi.as_view(),
        name="routes-create",
    ),
    path(
        "<str:user_id>/",
        views.RouteDetailApi.as_view(),
        name="routes-detail",
    ),
    path(
        "<str:user_id>/update/",
        views.RouteUpdateApi.as_view(),
        name="routes-update",
    ),
    path(
        "<str:user_id>/delete/",
        views.RouteDeleteApi.as_view(),
        name="routes-delete",
    ),
]

server_patterns = [
    path("", views.ServerListApi.as_view(), name="servers-list"),
    path(
        "create/",
        views.ServerCreateApi.as_view(),
        name="servers-create",
    ),
    path(
        "<str:server_id>/",
        views.ServerDetailApi.as_view(),
        name="servers-detail",
    ),
    path(
        "<str:server_id>/update/",
        views.ServerUpdateApi.as_view(),
        name="servers-update",
    ),
    path(
        "<str:server_id>/delete/",
        views.ServerDeleteApi.as_view(),
        name="servers-delete",
    ),
    path("<str:server_id>/routes/", include((route_patterns, "routes"))),
    path(
        "<str:server_id>/organizations/",
        views.ServerOrganizationListApi.as_view(),
        name="servers-organizations-list",
    ),
    path(
        "<str:server_id>/organizations/<str:org_id>/attach/",
        views.ServerAttachOrganizationApi.as_view(),
        name="servers-organizations-attach",
    ),
    path(
        "<str:server_id>/output/",
        views.ServerOutputApi.as_view(),
        name="servers-output",
    ),
]

api_patterns = [
    path("organizations/", include((organization_patterns, "organizations"))),
    path("servers/", include((server_patterns, "servers"))),
    path("status/", views.SystemStatusApi.as_view(), name="system-status"),
    path("server-logs/", views.ServerLogsApi.as_view(), name="server-logs"),
    path("system-logs/", views.SystemLogsApi.as_view(), name="system-logs"),
]

app_name = "pritunl_api"
urlpatterns = [
    path(
        "users/",
        views.UsersOrganizationsView.as_view(),
        name="users-organizations-view",
    ),
    path("servers/", views.ServersView.as_view(), name="servers-view"),
    path("api/", include((api_patterns, "api"))),
]
