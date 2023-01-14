from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('pritunl/', include('pritunl_api.urls')),
    path('admin/', admin.site.urls),
]
