from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import (
    Serializer,
    CharField,
    IntegerField,
    ChoiceField,
    ListField,
)

from pritunl_api.pritunl_request import auth_request
from pritunl_api.selectors.servers import (
    get_all_servers,
    get_server_by_id,
    get_server_orgs,
    get_server_output,
)
from pritunl_api.serializers import ServerSerializer
from pritunl_api.services.servers import (
    attach_org_to_server,
    create_server,
    delete_entities,
    delete_server,
    detach_org_from_server,
    restart_server,
    start_server,
    stop_server,
    update_server,
)
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
        groups = ListField(required=False, child=CharField(), allow_empty=False)
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

        return Response(status=status.HTTP_204_NO_CONTENT)


class ServerStartApi(APIView):
    """
    Starts server.
    """

    def put(self, request, server_id) -> Response:
        data = start_server(server_id=server_id)

        return Response(data, status.HTTP_200_OK)


class ServerStopApi(APIView):
    """
    Stops server.
    """

    def put(self, request, server_id) -> Response:
        data = stop_server(server_id=server_id)

        return Response(data, status.HTTP_200_OK)


class ServerRestartApi(APIView):
    """
    Restarts server.
    """

    def put(self, request, server_id) -> Response:
        data = restart_server(server_id=server_id)

        return Response(data, status.HTTP_200_OK)


class ServerOutputApi(APIView):
    """
    Returns output of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        data = get_server_output(server_id)

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


class ServerAttachOrganizationApi(APIView):
    """
    Attaches organization to a server.
    """

    def put(self, request, server_id, org_id) -> Response:
        data = attach_org_to_server(server_id=server_id, org_id=org_id)

        return Response(data, status.HTTP_200_OK)


class ServerDetachOrganizationApi(APIView):
    """
    Detaches organization from a server.
    """

    def delete(self, request, server_id, org_id) -> Response:
        data = detach_org_from_server(server_id=server_id, org_id=org_id)

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


class ServerDeleteEntitiesApi(APIView):
    """
    Deletes routes or detaches organizations specified by their IDs
    """

    class InputSerializer(Serializer):
        class EntitySerializer(Serializer):
            entity_type = ChoiceField(
                choices=[("route", "route"), ("organization", "organization")]
            )
            entity_id = CharField()

        entities = ListField(child=EntitySerializer(), allow_empty=False)

    def delete(self, request, server_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        delete_entities(server_id=server_id, **serializer.data)

        return Response(status=status.HTTP_204_NO_CONTENT)


class EventApi(APIView):
    """
    Returns list of events
    """

    def get(self, request) -> Response:
        event_id: str = request.query_params.get("id", None)
        path = f"/event/{event_id}" if event_id else "/event"
        response = auth_request(method="GET", path=path, raise_err=True)

        return Response(data=response.json(), status=status.HTTP_200_OK)
