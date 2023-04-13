from typing import Dict

from pritunl_api.pritunl_request import auth_request


def get_all_users(org_id: str) -> Dict:
    response = auth_request(method="GET", path=f"/user/{org_id}", raise_err=True)
    return response.json()


def get_user_by_id(*, user_id: str, org_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/user/{org_id}/{user_id}", raise_err=True
    )
    return response.json()


def get_user_links(*, user_id: str, org_id: str) -> Dict:
    response = auth_request(
        method="GET", path=f"/key/{org_id}/{user_id}", raise_err=True
    )
    return response.json()
