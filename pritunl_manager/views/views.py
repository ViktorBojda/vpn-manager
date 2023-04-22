from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class UsersOrganizationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return render(request, "pritunl_manager/users_orgs.html")


class ServersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return render(request, "pritunl_manager/servers.html")
