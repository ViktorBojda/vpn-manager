from rest_framework import status
from rest_framework.response import Response
from rest_framework.serializers import Serializer, CharField
from rest_framework.views import APIView

from pritunl_api.selectors.organizations import get_all_organizations, get_organization_by_id
from pritunl_api.services.organizations import create_organization, delete_organization, update_organization


class OrganizationCreateApi(APIView):
    """
    Creates new organization.
    """

    class InputSerializer(Serializer):
        name = CharField()

    def post(self, request) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = create_organization(**serializer.data)

        return Response(data, status.HTTP_201_CREATED)


class OrganizationListApi(APIView):
    """
    Returns list of all organizations.
    """

    def get(self, request) -> Response:
        data = get_all_organizations()

        return Response(data, status.HTTP_200_OK)


class OrganizationDetailApi(APIView):
    """
    Returns organization specified by id.
    """

    def get(self, request, org_id) -> Response:
        data = get_organization_by_id(org_id)

        return Response(data, status.HTTP_200_OK)


class OrganizationUpdateApi(APIView):
    """
    Updates organization specified by id.
    """

    class InputSerializer(Serializer):
        name = CharField()

    def put(self, request, org_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = update_organization(org_id=org_id, **serializer.data)

        return Response(data, status.HTTP_200_OK)


class OrganizationDeleteApi(APIView):
    """
    Deletes organization specified by id.
    """

    def delete(self, request, org_id) -> Response:
        delete_organization(org_id)

        return Response(status.HTTP_204_NO_CONTENT)
