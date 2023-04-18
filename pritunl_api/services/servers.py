import json
from typing import Dict, List
from pritunl_api.exceptions import PritunlAPIException

from pritunl_api.pritunl_request import auth_request
from pritunl_api.selectors.servers import get_server_by_id, get_server_orgs
from pritunl_api.services.routes import delete_route


def create_server(**kwargs) -> Dict:
    response = auth_request(
        method="POST",
        path="/server",
        headers={"Content-Type": "application/json"},
        data=json.dumps(kwargs),
        raise_err=True,
    )
    return response.json()


def update_server(*, server_id: str, **kwargs) -> Dict:
    server = get_server_by_id(server_id)
    server.update(kwargs)
    was_online = stop_server_if_online_and_verify(server_id)

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}",
        headers={"Content-Type": "application/json"},
        data=json.dumps(server),
        raise_err=True,
    )
    if was_online:
        start_server_if_offline_and_verify(server_id)
    return response.json()


def delete_server(server_id: str):
    auth_request(method="DELETE", path=f"/server/{server_id}", raise_err=True)


def start_server(server_id: str) -> Dict:
    server = get_server_by_id(server_id)
    server.update({"operation": "start"})

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/operation/start",
        headers={"Content-Type": "application/json"},
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
        headers={"Content-Type": "application/json"},
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
        headers={"Content-Type": "application/json"},
        data=json.dumps(server),
        raise_err=True,
    )
    return response.json()


def attach_org_to_server(*, server_id: str, org_id: str):
    data = {"id": org_id, "server": server_id}
    was_online = stop_server_if_online_and_verify(server_id)

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/organization/{org_id}",
        headers={"Content-Type": "application/json"},
        data=json.dumps(data),
        raise_err=True,
    )
    if was_online:
        start_server_if_offline_and_verify(server_id)
    return response.json()


def detach_org_from_server(*, org_id: str, server_id: str):
    data = {"id": org_id, "server": server_id}

    response = auth_request(
        method="DELETE",
        path=f"/server/{server_id}/organization/{org_id}",
        headers={"Content-Type": "application/json"},
        data=json.dumps(data),
        raise_err=True,
    )
    return response.json()


def delete_entities(*, server_id: str, entities: List[Dict[str, str]]):
    was_online = stop_server_if_online_and_verify(server_id)

    for entity in entities:
        if entity["entity_type"] == "route":
            delete_route(route_id=entity["entity_id"], server_id=server_id)
        elif entity["entity_type"] == "organization":
            detach_org_from_server(org_id=entity["entity_id"], server_id=server_id)

    attached_orgs = get_server_orgs(server_id)
    if was_online and attached_orgs:
        start_server_if_offline_and_verify(server_id)


def stop_server_if_online_and_verify(server_id) -> bool:
    was_online = False
    server = get_server_by_id(server_id)
    if server["status"] != "offline":
        server = stop_server(server_id)
        if server["status"] != "offline":
            raise PritunlAPIException(
                detail="Failed to stop server.",
                code="server_stop_failed",
                status_code=500,
            )
        was_online = True
    return was_online


def start_server_if_offline_and_verify(server_id):
    server = get_server_by_id(server_id)
    if server["status"] != "online":
        server = start_server(server_id)
        if server["status"] != "online":
            raise PritunlAPIException(
                detail="Failed to start server.",
                code="server_start_failed",
                status_code=500,
            )
