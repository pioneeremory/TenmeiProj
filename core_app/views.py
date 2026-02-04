from rest_framework.views import APIView
from rest_framework.response import Response
from .models import MainCharacter
from .serializers import MainCharacterSerializer

class AllCharacters(APIView):
    def get(self, request):
        # Query the database
        characters = MainCharacter.objects.order_by("name")
        serializer = MainCharacterSerializer(characters, many=True)
        return Response(serializer.data)