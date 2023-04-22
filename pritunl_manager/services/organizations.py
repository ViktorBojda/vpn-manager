import json
from typing import Dict

from pritunl_manager.pritunl_request import auth_request
from pritunl_manager.selectors.organizations import get_organization_by_id


def create_organization(*, name: str) -> Dict:
    args = locals()

    response = auth_request(
        method="POST",
        path="/organization",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(args),
        raise_err=True,
    )
    return response.json()


def update_organization(*, org_id: str, name: str) -> Dict:
    args = locals()
    del args["org_id"]

    org = get_organization_by_id(org_id)
    org.update(args)

    response = auth_request(
        method="PUT",
        path=f"/organization/{org_id}",
        headers={
            "Content-Type": "application/json",
        },
        data=json.dumps(org),
        raise_err=True,
    )

    return response.json()


def delete_organization(org_id: str):
    auth_request(method="DELETE", path=f"/organization/{org_id}", raise_err=True)
