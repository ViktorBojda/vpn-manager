import ipaddress
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_ipv4_network_address(value):
    try:
        ipaddress.ip_network(value, strict=False)
    except ValueError:
        raise ValidationError(
            _("Enter a valid IPv4 network address."),
            code="invalid",
            params={"value": value},
        )
    else:
        if not re.match(
            r"^(10\.\b([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.\b([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.0\/\b([8-9]|[12][0-9]|30))$|^(172\.\b([1][6-9]|[2][0-9]|[3][0-1])\.\b([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.0\/\b([8-9]|[12][0-9]|30))$|^(192\.168\.\b([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.0\/\b([8-9]|[12][0-9]|30))$",
            value,
        ):
            raise ValidationError(
                _(
                    "Network address is not valid, format must be '[10,172,192].[0-255,16-31,168].[0-255].0/[8-24]' such as '10.12.32.0/24'."
                ),
                code="invalid",
                params={"value": value},
            )
