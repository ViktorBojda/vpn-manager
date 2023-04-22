import json
from typing import Dict, List, Optional

from pritunl_manager.pritunl_request import auth_request
from pritunl_manager.selectors.users import get_user_by_id


def create_user(
    *,
    org_id: str,
    name: str,
    email: Optional[str] = None,
    groups: Optional[List[str]] = None,
    pin: Optional[str] = None,  # TODO only numbers
    # TODO yubico_id
    # TODO port_forwarding
    # TODO network_links
    # TODO client_to_client
    # TODO auth_type
    # TODO mac_addresses
    # TODO dns_serve
    # TODO dns_suffi
    # TODO bypass_secondary
) -> Dict:
    data = locals()
    del data["org_id"]

    response = auth_request(
        method="POST",
        path=f"/user/{org_id}",
        headers={"Content-Type": "application/json"},
        data=json.dumps(data),
        raise_err=True,
    )
    return response.json()


def update_user(*, user_id: str, org_id: str, **kwargs) -> Dict:
    user = get_user_by_id(user_id=user_id, org_id=org_id)
    user.update(kwargs)
    
    response = auth_request(
        method="PUT",
        path=f"/user/{org_id}/{user_id}",
        headers={"Content-Type": "application/json"},
        data=json.dumps(user),
        raise_err=True,
    )
    return response.json()


def delete_user(*, user_id: str, org_id: str):
    auth_request(method="DELETE", path=f"/user/{org_id}/{user_id}", raise_err=True)


def bulk_create_user(*, org_id: str, user_list: List[Dict[str, Optional[str]]]) -> List[Dict]:
    response = auth_request(
        method="POST",
        path=f"/user/{org_id}/multi",
        headers={"Content-Type": "application/json"},
        data=json.dumps(user_list),
        raise_err=True,
    )
    return response.json()
