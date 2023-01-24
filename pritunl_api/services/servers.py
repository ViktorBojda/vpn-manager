from ipaddress import IPv4Address
import json
from typing import Dict, Optional

from pritunl_api.pritunl_request import auth_request
from pritunl_api.selectors.servers import get_server_by_id


def create_server(**kwargs) -> Dict:
    response = auth_request(
        method="POST",
        path="/server",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(kwargs),
        raise_err=True,
    )
    return response.json()


def update_server(*, server_id: str, **kwargs) -> Dict:
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


def start_server(server_id: str) -> Dict:
    server = get_server_by_id(server_id)
    server.update({"operation": "start"})

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/operation/start",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(server),
        raise_err=True,
    )
    return response.json()


def stop_server(server_id: str) -> Dict:
    server = get_server_by_id(server_id)
    server.update({"operation": "stop"})

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/operation/stop",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(server),
        raise_err=True,
    )
    return response.json()


def restart_server(server_id: str) -> Dict:
    server = get_server_by_id(server_id)
    server.update({"operation": "restart"})

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/operation/restart",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(server),
        raise_err=True,
    )
    return response.json()


def attach_org_to_server(*, server_id: str, org_id: str):
    data = {"id": org_id, "server": server_id}

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/organization/{org_id}",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(data),
        raise_err=True,
    )
    return response.json()


def detach_org_from_server(*, server_id: str, org_id: str):
    data = {"id": org_id, "server": server_id}

    response = auth_request(
        method="DELETE",
        path=f"/server/{server_id}/organization/{org_id}",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(data),
        raise_err=True,
    )
    return response.json()
