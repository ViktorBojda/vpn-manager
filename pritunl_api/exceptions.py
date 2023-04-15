from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework.response import Response

class PritunlAPIException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Something went wrong.'
    default_code = 'error'

    def __init__(self, detail=None, code=None, status_code=None):
        if detail is not None:
            self.detail = detail
        if code is not None:
            self.code = code
        if status_code is not None:
            self.status_code = status_code

    def get_full_details(self):
        return {'message': self.detail, 'code': self.code}

def pritunl_exception_handler(exc, context):
    return Response(exc.get_full_details(), exc.status_code)