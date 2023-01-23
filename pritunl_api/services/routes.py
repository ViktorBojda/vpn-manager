import json
from typing import Dict

from pritunl_api.pritunl_request import auth_request
from pritunl_api.selectors.routes import get_route_by_id


def create_route(*, server_id: str, **kwargs) -> Dict:
    response = auth_request(
        method="POST",
        path=f"/server/{server_id}/route",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(kwargs),
        raise_err=True,
    )
    return response.json()


def update_route(*, route_id: str, server_id: str, **kwargs) -> Dict:
    route = get_route_by_id(route_id=route_id, server_id=server_id)
    route.update(kwargs)

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/route/{route_id}",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(route),
        raise_err=True,
    )
    return response.json()


def delete_route(*, route_id: str, server_id: str):
    auth_request(
        method="DELETE", path=f"/server/{server_id}/route/{route_id}", raise_err=True
    )
