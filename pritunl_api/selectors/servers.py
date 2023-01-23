from typing import Dict

from pritunl_api.pritunl_request import auth_request


def get_all_servers() -> Dict:
    response = auth_request(method="GET", path="/server", raise_err=True)
    return response.json()


def get_server_by_id(server_id: str) -> Dict:
    response = auth_request(method="GET", path=f"/server/{server_id}", raise_err=True)
    return response.json()


def get_server_output(server_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/server/{server_id}/output", raise_err=True
    )
    return response.json()


def get_server_routes(server_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/server/{server_id}/route", raise_err=True
    )
    return response.json()


def get_server_orgs(server_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/server/{server_id}/organization", raise_err=True
    )
    return response.json()
