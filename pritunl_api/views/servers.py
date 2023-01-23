from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import (
    Serializer,
    CharField,
    IntegerField,
    ChoiceField,
)

from pritunl_api.pritunl_request import auth_request
from pritunl_api.selectors.servers import get_all_servers, get_server_by_id, get_server_orgs, get_server_output, get_server_routes
from pritunl_api.serializers import ServerSerializer
from pritunl_api.services.servers import create_server, delete_server, update_server
from pritunl_api.validators import validate_ipv4_network_address


class ServerCreateApi(APIView):
    """
    Creates new server.
    """

    InputSerializer = ServerSerializer

    def post(self, request) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = create_server(**serializer.data)

        return Response(data, status.HTTP_201_CREATED)

class ServerListApi(APIView):
    """
    Returns list of all servers.
    """

    def get(self, request) -> Response:
        data = get_all_servers()

        return Response(data, status.HTTP_200_OK)


class ServerDetailApi(APIView):
    """
    Returns server specified by id.
    """

    def get(self, request, server_id) -> Response:
        data = get_server_by_id(server_id)

        return Response(data, status.HTTP_200_OK)


class ServerUpdateApi(APIView):
    """
    Updates server specified by id.
    """

    class InputSerializer(Serializer):
        name = CharField(required=False)
        network = CharField(required=False, validators=[validate_ipv4_network_address])
        port = IntegerField(required=False, min_value=1, max_value=65535)
        protocol = ChoiceField(required=False, choices=[("tcp", "tcp"), ("udp", "udp")])

    def put(self, request, server_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = update_server(server_id=server_id, **serializer.data)

        return Response(data, status.HTTP_200_OK)


class ServerDeleteApi(APIView):
    """
    Deletes server specified by id.
    """

    def delete(self, request, server_id) -> Response:
        delete_server(server_id)

        return Response(status.HTTP_204_NO_CONTENT)


class ServerOutputApi(APIView):
    """
    Returns output of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        data = get_server_output(server_id)

        return Response(data, status.HTTP_200_OK)


class ServerRouteListApi(APIView):
    """
    Returns list of routes of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        data = get_server_routes(server_id)

        return Response(data, status.HTTP_200_OK)


class ServerLinkApi(APIView):
    """
    Returns link output of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(
            method="GET", path=f"/server/{server_id}/link", raise_err=True
        )

        return Response(data=response.json(), status=status.HTTP_200_OK)


class ServerOrganizationListApi(APIView):
    """
    Returns list of organizations attached to the server specified by id.
    """

    def get(self, request, server_id) -> Response:
        data = get_server_orgs(server_id)

        return Response(data, status.HTTP_200_OK)


class ServerHostListApi(APIView):
    """
    Returns list of hosts attached to the server specified by id.
    """

    def get(self, request, server_id) -> Response:
        response = auth_request(
            method="GET", path=f"/server/{server_id}/host", raise_err=True
        )

        return Response(data=response.json(), status=status.HTTP_200_OK)
