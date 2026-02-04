from django.urls import path
from .views import AllCharacters
# Remember all urls are prefaced by http://localhost:8000/api/v1/pokemon/
urlpatterns = [
    path('', AllCharacters.as_view(), name='all_characters')
]