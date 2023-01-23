from typing import Dict

from pritunl_api.pritunl_request import auth_request


def get_all_routes(server_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/server/{server_id}/route", raise_err=True
    )
    return response.json()


def get_route_by_id(*, route_id: str, server_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/server/{server_id}/route/{route_id}", raise_err=True
    )
    return response.json()
