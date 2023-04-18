from typing import Dict
from rest_framework.exceptions import NotFound

from pritunl_api.pritunl_request import auth_request


def get_all_routes(server_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/server/{server_id}/route", raise_err=True
    )
    return response.json()


def get_route_by_id(*, route_id: str, server_id: str) -> Dict:
    routes = get_all_routes(server_id)
    for route in routes:
        if route['id'] == route_id:
            return route
    raise NotFound('No route with given ID found.')
