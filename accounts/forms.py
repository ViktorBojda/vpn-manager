from django.contrib.auth.forms import (
    UserCreationForm as DjangoUserCreationForm,
    UserChangeForm as DjangoUserChangeForm,
)

from .models import User


class UserCreationForm(DjangoUserCreationForm):
    class Meta:
        model = User
        fields = ("username",)


class UserChangeForm(DjangoUserChangeForm):
    class Meta:
        model = User
        fields = ("username",)
