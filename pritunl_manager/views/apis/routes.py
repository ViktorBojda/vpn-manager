from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import (
    Serializer,
    CharField,
    ListField
)

from pritunl_manager.selectors.routes import get_all_routes, get_route_by_id
from pritunl_manager.serializers import RouteSerializer
from pritunl_manager.services.routes import bulk_create_route, create_route, delete_route, update_route


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
    

class RouteBulkCreateApi(APIView):
    """
    Creates new users in bulk for organization.
    """

    class InputSerializer(Serializer):
        route_list = ListField(child=RouteSerializer(), allow_empty=False)

    def post(self, request, server_id) -> Response:
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = bulk_create_route(server_id=server_id, **serializer.data)

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
        comment = CharField(required=False, allow_blank=True, allow_null=True)

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