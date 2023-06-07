import json
import socket
import pritunl_manager.services.servers as servers
from typing import Dict, List, Optional

from pritunl_manager.pritunl_request import auth_request
from pritunl_manager.selectors.routes import get_route_by_id


def create_route(*, server_id: str, **kwargs) -> Dict:
    was_online = servers.stop_server_if_online_and_verify(server_id)
    network = kwargs.get("network", None)
    kwargs["nat"] = True
    if network and is_dns_name(network):
        kwargs["network"] = socket.gethostbyname(network)
        comment = kwargs.get("comment", None)
        if comment is None:
            kwargs["comment"] = network

    response = auth_request(
        method="POST",
        path=f"/server/{server_id}/route",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(kwargs),
        raise_err=True,
    )
    if was_online:
        servers.start_server_if_offline_and_verify(server_id)
    return response.json()


def update_route(*, route_id: str, server_id: str, **kwargs) -> Dict:
    route = get_route_by_id(route_id=route_id, server_id=server_id)
    route.update(kwargs)
    was_online = servers.stop_server_if_online_and_verify(server_id)

    response = auth_request(
        method="PUT",
        path=f"/server/{server_id}/route/{route_id}",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(route),
        raise_err=True,
    )
    if was_online:
        servers.start_server_if_offline_and_verify(server_id)
    return response.json()


def delete_route(*, route_id: str, server_id: str):
    auth_request(
        method="DELETE", path=f"/server/{server_id}/route/{route_id}", raise_err=True
    )


def bulk_create_route(
    *, server_id: str, route_list: List[Dict[str, Optional[str]]]
) -> List[Dict]:
    was_online = servers.stop_server_if_online_and_verify(server_id)
    for route in route_list:
        network = route.get("network", None)
        route["nat"] = True # type: ignore
        if network and is_dns_name(network):
            route["network"] = socket.gethostbyname(network)
            comment = route.get("comment", None)
            if comment is None:
                route["comment"] = network

    response = auth_request(
        method="POST",
        path=f"/server/{server_id}/routes",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(route_list),
        raise_err=True,
    )
    if was_online:
        servers.start_server_if_offline_and_verify(server_id)
    return response.json()


def is_dns_name(addr):
    try:
        socket.gethostbyname(addr)
        return True
    except socket.gaierror:
        return False
