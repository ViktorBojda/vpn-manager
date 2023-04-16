from email.policy import default
from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework.response import Response

class PritunlAPIException(APIException):
    default_detail = 'Something went wrong.'
    default_code = 'error'

    def __init__(self, detail=None, code=None, status_code=None):
        if detail is None:
            detail = self.default_detail
        if code is None:
            code = self.default_code
        if status_code is None:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        super().__init__(detail, code)

def pritunl_exception_handler(exc, context):
    return Response(exc.get_full_details(), exc.status_code)