from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateAPIView # trying built-in generics for this view
from .models import MainCharacter, GameSession
from .serializers import MainCharacterSerializer, GameSessionSerializer

class AllCharacters(APIView):
    def get(self, request):
        # Query the database
        characters = MainCharacter.objects.order_by("name")
        serializer = MainCharacterSerializer(characters, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MainCharacterSerializer(data=request.data)
        if serializer.is_valid():
            # Pass the user during the save process
            serializer.save(user=request.user) 
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)  
              
class AllSessions(APIView):
    def get(self, request):
        # Query the database
        sessions = GameSession.objects.order_by("character__name") # dunder allows us to perform lookup across tables linked by FKs
        serializer = GameSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        new_session = GameSession.objects.create(**request.data)
        new_session.save()
        new_session.full_clean()
        new_session = json.loads(serialize('json', [new_session]))
        return Response(new_session)  

class SessionDetail(RetrieveUpdateAPIView):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    # This automatically handles GET (viewing) and PATCH (updating rice/grit)