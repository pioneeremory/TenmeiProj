from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import MainCharacter, GameSession
from .serializers import MainCharacterSerializer, GameSessionSerializer
from rest_framework.authentication import TokenAuthentication 
from rest_framework.permissions import IsAuthenticated
from .services import StoryService
# from rest_framework.generics import RetrieveUpdateAPIView # trying built-in generics for this view

class AllCharacters(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

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
    authentication_classes = [TokenAuthentication] 
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Query the database
        sessions = GameSession.objects.order_by("character__name") # dunder allows us to perform lookup across tables linked by FKs
        serializer = GameSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GameSessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class SessionDetail(viewsets.ModelViewSet):

    authentication_classes = [TokenAuthentication] 
    permission_classes = [IsAuthenticated]
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    # this is a viewset that will handle all CRUD operations for the GameSession model and offer more than one api endpoint by action title
    @action(detail=True, methods=['post'])
    def scavenge(self, request, pk=None):
        session = self.get_object()
        roll_value, success = session.roll_dice(difficulty=10)

        if success:
            session.rice += 2
        narration = StoryService.generate_narration(
            session, "scavenge", success, roll_value
        )
        session.current_cycle += 1
        session.save()
        return Response({"status": "Scavanged", "success": success, "narration": narration, "You rolled a": roll_value, "rice": session.rice})
    @action(detail=True, methods=['post'])
    def rest(self, request, pk=None):
        sessions = self.get_object()
        sessions.grit += 1
        sessions.rice -= 1
        sessions.current_cycle += 1
        sessions.save()
        return Response({"status": "Rested", "grit": sessions.grit, "rice": sessions.rice})