import json
import requests, time, uuid, hmac, hashlib, base64
from django.conf import settings

from pritunl_api.exceptions import PritunlAPIException

BASE_URL = settings.BASE_URL
API_TOKEN = settings.API_TOKEN
API_SECRET = settings.API_SECRET


def auth_request(
    method, path, headers=None, data=None, raise_err=False
) -> requests.Response:
    auth_timestamp = str(int(time.time()))
    auth_nonce = uuid.uuid4().hex
    auth_string = "&".join(
        [API_TOKEN, auth_timestamp, auth_nonce, method.upper(), path]
    )
    auth_signature = base64.b64encode(
        hmac.new(
            API_SECRET.encode("utf-8"), auth_string.encode("utf-8"), hashlib.sha256
        ).digest()
    )

    auth_headers = {
        "Auth-Token": API_TOKEN,
        "Auth-Timestamp": auth_timestamp,
        "Auth-Nonce": auth_nonce,
        "Auth-Signature": auth_signature,
    }

    if headers:
        auth_headers.update(headers)

    response = getattr(requests, method.lower())(
        BASE_URL + path,
        headers=auth_headers,
        data=data,
        verify=False,
    )

    if raise_err:
        try:
            response.raise_for_status()
        except requests.HTTPError:
            err_dict = json.loads(response.text)
            raise PritunlAPIException(err_dict['error_msg'], err_dict['error'], response.status_code)
    return response
