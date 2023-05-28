from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import (
    Serializer,
    CharField,
    EmailField,
    ListField,
)

from pritunl_manager.selectors.users import get_all_users, get_user_by_id, get_user_links
from pritunl_manager.serializers import UserSerializer
from pritunl_manager.services.users import (
    bulk_create_user,
    create_user,
    delete_user,
    update_user,
)


class UserCreateApi(APIView):
    """
    Creates new user for organization.
    """
    
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
    Returns user detail specified by id and by assigned organization.
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
        email = EmailField(required=False, allow_blank=True, allow_null=True)
        groups = ListField(required=False, child=CharField(), allow_empty=True, allow_null=True)

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


class UserLinksApi(APIView):
    """
    Returns user's links specified by id and by assigned organization.
    """

    def get(self, request, org_id, user_id) -> Response:
        data = get_user_links(user_id=user_id, org_id=org_id)
        data["base_url"] = settings.BASE_URL

        return Response(data, status.HTTP_200_OK)
