import json
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from pritunl_api.pritunl_request import auth_request


class ServerListApi(APIView):
    """
    Returns list of all servers.
    """

    def get(self, request) -> Response:
        response = auth_request(method="GET", path="/server", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerDetailApi(APIView):
    """
    Returns server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(method="GET", path=f"/server/{server_id}", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerOutputApi(APIView):
    """
    Returns output of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(method="GET", path=f"/server/{server_id}/output", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerRouteApi(APIView):
    """
    Returns routes of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(method="GET", path=f"/server/{server_id}/route", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerLinkApi(APIView):
    """
    Returns link output of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(method="GET", path=f"/server/{server_id}/link", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerOrganizationListApi(APIView):
    """
    Returns list of organizations attached to the server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(method="GET", path=f"/server/{server_id}/organization", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerHostListApi(APIView):
    """
    Returns list of hosts attached to the server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(method="GET", path=f"/server/{server_id}/host", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)
