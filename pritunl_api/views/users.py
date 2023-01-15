import json
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from pritunl_api.pritunl_request import auth_request
from pritunl_api.serializers import UserSerializer


class UserCreateApi(APIView):
    """
    Creates new user for organization.
    """

    # {'id':null,'organization':'6381f3eff5fffa5ebb491b59','organization_name':null,'name':'user3','email':'user3@email.com','groups':['group1'],
    # 'last_active':null,'gravatar':null,'audit':null,'type':null,'auth_type':'local','yubico_id':'','status':null,'sso':null,'otp_auth':null,
    # 'otp_secret':null,'servers':null,'disabled':null,'network_links':[],'dns_mapping':null,'bypass_secondary':false,'client_to_client':false,
    # 'dns_servers':[],'dns_suffix':'','port_forwarding':[{'protocol':'tcp','port':'80','dport':'8000'}],'pin':'123456','mac_addresses':[]}
    InputSerializer = UserSerializer

    def post(self, request, org_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response = auth_request(
            method="POST",
            path=f"/user/{org_id}",
            headers={
                "Content-Type": "application/json",
            },
            data=json.dumps(serializer.data),
            raise_err=True,
        )

        return Response(data=response.json(), status=status.HTTP_201_CREATED)


class UserListApi(APIView):
    """
    Returns list of all users assigned to organization.
    """

    def get(self, request, org_id) -> Response:
        response = auth_request(method="GET", path=f"/user/{org_id}", raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)


class UserDetailApi(APIView):
    """
    Returns user specified by id and by assigned organization.
    """

    def get(self, request, org_id, user_id) -> Response:
        response = auth_request(
            method="GET", path=f"/user/{org_id}/{user_id}", raise_err=True
        )

        return Response(data=response.json(), status=status.HTTP_200_OK)


class UserUpdateApi(APIView):
    """
    Updates user specified by id and by assigned organization.
    """

    InputSerializer = UserSerializer

    def put(self, request, org_id, user_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_detail = auth_request(
            method="GET", path=f"/user/{org_id}/{user_id}", raise_err=True
        )

        updated_dict = user_detail.json()
        updated_dict.update(serializer.data)

        response = auth_request(
            method="PUT",
            path=f"/user/{org_id}/{user_id}",
            headers={
                "Content-Type": "application/json",
            },
            data=json.dumps(updated_dict),
            raise_err=True,
        )

        return Response(data=response.json(), status=status.HTTP_200_OK)


class UserDeleteApi(APIView):
    """
    Deletes user specified by id and by assigned organization.
    """

    def delete(self, request, org_id, user_id) -> Response:
        auth_request(method="DELETE", path=f"/user/{org_id}/{user_id}", raise_err=True)

        return Response(status=status.HTTP_204_NO_CONTENT)
