from typing import Dict
from pritunl_api.pritunl_request import auth_request


def get_all_organizations() -> Dict:
    response = auth_request(method="GET", path="/organization", raise_err=True)
    return response.json()


def get_organization_by_id(org_id: str) -> Dict:
    response = auth_request(method="GET", path=f"/organization/{org_id}", raise_err=True)
    return response.json()
