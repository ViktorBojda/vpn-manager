from django.views.generic.base import TemplateView


class UserOrganizationView(TemplateView):
    template_name = "pritunl_api/users_organizations.html"