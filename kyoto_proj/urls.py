# kyoto_proj/urls.py
from django.contrib import admin
from django.urls import path, include
from core_app.views import GameSessionViewSet

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include("accounts.urls")),
    # This captures EVERYTHING in core_app and prefixes it with 'api/'
    path('api/', include("core_app.urls")), 
]