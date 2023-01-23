from ipaddress import IPv4Address
import json
from typing import Dict, Optional

from pritunl_api.pritunl_request import auth_request
from pritunl_api.selectors.servers import get_server_by_id


def create_server(
    *,
    name: str,
    network: IPv4Address,
    port: int,
    protocol: str,
) -> Dict:
    args = locals()

    response = auth_request(
        method="POST",
        path="/server",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(args),
        raise_err=True,
    )
    return response.json()


def update_server(
    *,
    server_id: str,
    **kwargs
) -> Dict:
    server = get_server_by_id(server_id)
    server.update(kwargs)

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(server),
        raise_err=True,
    )
    return response.json()


def delete_server(server_id: str):
    auth_request(method="DELETE", path=f"/server/{server_id}", raise_err=True)