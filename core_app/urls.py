from django.urls import path
from .views import AllCharacters, AllSessions
urlpatterns = [
    path('characters/', AllCharacters.as_view(), name='all_characters'),
    path('sessions/', AllSessions.as_view(), name='all_sessions')
]