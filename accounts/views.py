from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect, render
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.serializers import (
    Serializer,
    CharField,
)


class UserLoginView(APIView):
    """
    Authenticates user's credentials and logs user in
    """
    permission_classes = [AllowAny]

    class InputSerializer(Serializer):
        username = CharField(max_length=150)
        password = CharField(max_length=128)

    def get(self, request):
        if request.user.is_authenticated:
            return redirect(request.query_params.get("next", "pritunl_manager:users-organizations-view"))
        return render(request, "accounts/login.html")

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(**serializer.data)
        if user is not None:
            login(request, user)
            return redirect(request.query_params.get("next", "pritunl_manager:users-organizations-view"))
        
        messages.error(request, 'Invalid username or password', "alert-danger")
        return render(request, "accounts/login.html")


class UserLogoutView(APIView):
    """
    Logs user out and redirects to login page
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        logout(request)
        messages.info(request, "Successfully logged out", "alert-info")
        return redirect("login-view")
