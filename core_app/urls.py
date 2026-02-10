from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AllCharacters, SessionDetail

#I needed to adopt a router in order to use the @action decorator to capture unique urls per user action in each session

router = DefaultRouter()

router.register(r'sessions', SessionDetail, basename='session')
urlpatterns = [
    path('characters/', AllCharacters.as_view(), name='all_characters'),
    path('', include(router.urls)), 
]