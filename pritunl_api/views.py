import json
from django.shortcuts import render
from requests import HTTPError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.serializers import (
    Serializer,
    BooleanField,
    CharField,
    EmailField,
    FloatField,
    IntegerField,
)
from rest_framework.views import APIView

from .pritunl_request import auth_request


class OrganizationCreateApi(APIView):
    """
    Creates new organization.
    """

    class InputSerializer(Serializer):
        name = CharField(required=True)

    def post(self, request) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response = auth_request(
            method="POST",
            path="/organization",
            headers={
                "Content-Type": "application/json",
            },
            data=json.dumps(serializer.data),
            raise_err=True,
        )

        return Response(data=response.json(), status=status.HTTP_201_CREATED)


class OrganizationListApi(APIView):
    """
    Returns list of all organizations.
    """

    def get(self, request) -> Response:
        response = auth_request(method="GET", path="/organization", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class OrganizationDetailApi(APIView):
    """
    Returns organization specified by id.
    """

    def get(self, request, org_id) -> Response:
        response = auth_request(
            method="GET", path=f"/organization/{org_id}", raise_err=True
        )

        return Response(data=response.json(), status=status.HTTP_200_OK)


class OrganizationUpdateApi(APIView):
    """
    Updates organization specified by id.
    """

    class InputSerializer(Serializer):
        name = CharField(required=True)

    def put(self, request, org_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        org_detail = auth_request(
            method="GET", path=f"/organization/{org_id}", raise_err=True
        )

        update_dict = org_detail.json()
        update_dict.update(serializer.data)

        response = auth_request(
            method="PUT",
            path=f"/organization/{org_id}",
            headers={
                "Content-Type": "application/json",
            },
            data=json.dumps(update_dict),
            raise_err=True,
        )

        return Response(data=response.json(), status=status.HTTP_200_OK)


class OrganizationDeleteApi(APIView):
    """
    Deletes organization specified by id.
    """

    def delete(self, request, org_id) -> Response:
        auth_request(method="DELETE", path=f"/organization/{org_id}", raise_err=True)

        return Response(status=status.HTTP_204_NO_CONTENT)
