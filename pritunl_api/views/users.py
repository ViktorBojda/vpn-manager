from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import (
    Serializer,
    CharField,
    EmailField,
    ListField,
)

from pritunl_api.selectors.users import get_all_users, get_user_by_id
from pritunl_api.serializers import UserSerializer
from pritunl_api.services.users import bulk_create_user, create_user, delete_user, update_user


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

        data = create_user(org_id=org_id, **serializer.data)

        return Response(data, status.HTTP_201_CREATED)


class UserBulkCreateApi(APIView):
    """
    Creates new users in bulk for organization.
    """

    class InputSerializer(Serializer):
        class NameEmailSerializer(Serializer):
            name = CharField()
            email = EmailField(required=False, allow_blank=True)

        user_list = ListField(child=NameEmailSerializer(), allow_empty=False)


    def post(self, request, org_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = bulk_create_user(org_id=org_id, **serializer.data)

        return Response(data, status.HTTP_201_CREATED)


class UserListApi(APIView):
    """
    Returns list of all users assigned to organization.
    """

    def get(self, request, org_id) -> Response:
        data = get_all_users(org_id)

        return Response(data, status.HTTP_200_OK)


class UserDetailApi(APIView):
    """
    Returns user specified by id and by assigned organization.
    """

    def get(self, request, org_id, user_id) -> Response:
        data = get_user_by_id(user_id=user_id, org_id=org_id)

        return Response(data, status.HTTP_200_OK)


class UserUpdateApi(APIView):
    """
    Updates user specified by id and by assigned organization.
    """

    class InputSerializer(Serializer):
        name = CharField(required=False)
        email = EmailField(required=False)
        groups = ListField(required=False, child=CharField(), allow_empty=False)
        pin = CharField(required=False, min_length=6)  # TODO only numbers

    def put(self, request, org_id, user_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = update_user(user_id=user_id, org_id=org_id, **serializer.data)

        return Response(data, status.HTTP_200_OK)


class UserDeleteApi(APIView):
    """
    Deletes user specified by id and by assigned organization.
    """

    def delete(self, request, org_id, user_id) -> Response:
        delete_user(user_id=user_id, org_id=org_id)

        return Response(status=status.HTTP_204_NO_CONTENT)
