from rest_framework.serializers import (
    Serializer,
    CharField,
    IntegerField,
    EmailField,
    ListField,
    ChoiceField,
)

from pritunl_api.validators import validate_ipv4_network_address


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


# {"name":"server2","network":"192.168.235.0/24","port":11147,"protocol":"udp","dh_param_bits":2048,
# "ipv6_firewall":true,"dns_servers":["8.8.8.8"],"cipher":"aes128","hash":"sha1","inter_client":true,
# "restrict_routes":true,"vxlan":true,"id":null,"status":null,"uptime":null,"users_online":null,
# "devices_online":null,"user_count":null,"network_wg":"","groups":[],"bind_address":null,
# "dynamic_firewall":false,"port_wg":null,"ipv6":false,"network_mode":"tunnel","network_start":"",
# "network_end":"","wg":false,"multi_device":false,"search_domain":null,"otp_auth":false,"sso_auth":false,
# "block_outside_dns":false,"jumbo_frames":null,"lzo_compression":null,"ping_interval":null,"ping_timeout":null,
# "link_ping_interval":null,"link_ping_timeout":null,"inactive_timeout":null,"session_timeout":null,
# "allowed_devices":null,"max_clients":null,"max_devices":null,"replica_count":1,"dns_mapping":false,
# "debug":false,"pre_connect_msg":null,"mss_fix":null}


class ServerSerializer(Serializer):
    name = CharField()
    network = CharField(validators=[validate_ipv4_network_address])
    groups = ListField(required=False, child=CharField(), allow_empty=False)
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


# {"id":null,"server":"6381f456f5fffa5ebb491bc0","network":"192.168.247.0/24","comment":"","metric":null,
# "virtual_network":null,"wg_network":null,"network_link":null,"server_link":null,"nat":true,"nat_interface":"",
# "nat_netmap":"","net_gateway":false,"advertise":false,"vpc_region":null,"vpc_id":null}
class RouteSerializer(Serializer):
    network = CharField(validators=[validate_ipv4_network_address])
