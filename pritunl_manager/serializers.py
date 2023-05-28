from rest_framework.serializers import (
    Serializer,
    CharField,
    IntegerField,
    EmailField,
    ListField,
    ChoiceField,
)

from pritunl_manager.validators import validate_ipv4_private_network_address


class UserSerializer(Serializer):
    name = CharField()
    email = EmailField(required=False, allow_blank=True, allow_null=True)
    groups = ListField(required=False, child=CharField(), allow_empty=True, allow_null=True)


class ServerSerializer(Serializer):
    name = CharField()
    network = CharField(validators=[validate_ipv4_private_network_address])
    groups = ListField(required=False, child=CharField(), allow_empty=True, allow_null=True)
    port = IntegerField(min_value=1, max_value=65535)
    protocol = ChoiceField(choices=[("tcp", "tcp"), ("udp", "udp")])
    network_mode = ChoiceField(choices=[("tunnel", "tunnel"), ("bridge", "bridge")])
    cipher = ChoiceField(
        choices=[
            ("none", "none"),
            ("bf128", "bf128"),
            ("bf256", "bf256"),
            ("aes128", "aes128"),
            ("aes192", "aes192"),
            ("aes256", "aes256"),
        ]
    )
    hash = ChoiceField(
        choices=[
            ("md5", "md5"),
            ("sha1", "sha1"),
            ("sha256", "sha256"),
            ("sha512", "sha512"),
        ]
    )


class RouteSerializer(Serializer):
    network = CharField()
    comment = CharField(allow_blank=True, allow_null=True)
