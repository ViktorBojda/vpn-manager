from django.views.generic.base import TemplateView


class UsersOrganizationsView(TemplateView):
    template_name = "pritunl_api/users_orgs.html"


class ServersView(TemplateView):
    template_name = "pritunl_api/servers.html"
