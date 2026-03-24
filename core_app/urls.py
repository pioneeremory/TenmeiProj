# core_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AllCharacters, GameSessionViewSet 

router = DefaultRouter()
# This handles /sessions/, /sessions/id/, and /sessions/id/scavenge/
router.register(r'sessions', GameSessionViewSet, basename='session')

urlpatterns = [
    path('characters/', AllCharacters.as_view(), name='all_characters'),
    path('characters/<int:pk>/', AllCharacters.as_view(), name='delete_character'), 
    path('', include(router.urls)), 
]
# I needed to adopt a router in order to use the @action decorator to capture unique urls per user action in each session


