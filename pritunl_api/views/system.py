from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from pritunl_api.pritunl_request import auth_request


class SystemStatusApi(APIView):
    """
    Returns basic system overview of organizations, users, etc.
    """

    def get(self, request) -> Response:
        response = auth_request(method="GET", path="/status", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerLogsApi(APIView):
    """
    Returns 50 most recent server logs.
    """

    def get(self, request) -> Response:
        response = auth_request(method="GET", path="/log", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class SystemLogsApi(APIView):
    """
    Returns system logs.
    """

    def get(self, request) -> Response:
        response = auth_request(method="GET", path="/logs", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)
