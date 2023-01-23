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
from pritunl_api.selectors.routes import get_all_routes, get_route_by_id
from pritunl_api.selectors.servers import get_all_servers, get_server_by_id, get_server_orgs, get_server_output, get_server_routes
from pritunl_api.serializers import RouteSerializer
from pritunl_api.services.routes import create_route, delete_route, update_route
from pritunl_api.services.servers import create_server, delete_server, update_server
from pritunl_api.validators import validate_ipv4_network_address


class RouteCreateApi(APIView):
    """
    Creates new route for server.
    """

    InputSerializer = RouteSerializer

    def post(self, request, server_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = create_route(server_id=server_id, **serializer.data)

        return Response(data, status.HTTP_201_CREATED)


class RouteListApi(APIView):
    """
    Returns list of routes of server specified by id.
    """

    def get(self, request, server_id) -> Response:
        data = get_all_routes(server_id)

        return Response(data, status.HTTP_200_OK)


class RouteDetailApi(APIView):
    """
    Returns route specified by id and by server id.
    """

    def get(self, request, route_id, server_id) -> Response:
        data = get_route_by_id(route_id=route_id, server_id=server_id)

        return Response(data, status.HTTP_200_OK)


class RouteUpdateApi(APIView):
    """
    Updates route specified by id and by server id.
    """

    class InputSerializer(Serializer):
        network = CharField(required=False, validators=[validate_ipv4_network_address])

    def put(self, request, route_id, server_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = update_route(route_id=route_id, server_id=server_id, **serializer.data)

        return Response(data, status.HTTP_200_OK)


class RouteDeleteApi(APIView):
    """
    Deletes route specified by id and by server id.
    """

    def delete(self, request, route_id, server_id) -> Response:
        delete_route(route_id=route_id, server_id=server_id)

        return Response(status=status.HTTP_204_NO_CONTENT)