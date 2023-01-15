from rest_framework.serializers import (
    Serializer,
    CharField,
    EmailField,
    ListField,
)


class UserSerializer(Serializer):
    name = CharField()
    email = EmailField(required=False)
    groups = ListField(required=False, child=CharField(), allow_empty=False)
    pin = CharField(required=False, min_length=6)  # TODO only numbers
    # TODO yubico_id
    # TODO port_forwarding
    # TODO network_links
    # TODO client_to_client
    # TODO auth_type
    # TODO mac_addresses
    # TODO dns_serve
    # TODO dns_suffi
    # TODO bypass_secondary
