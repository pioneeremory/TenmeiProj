# core_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.authentication import TokenAuthentication 
from rest_framework.permissions import IsAuthenticated
from .models import MainCharacter, GameSession
from .serializers import MainCharacterSerializer, GameSessionSerializer
from .services import StoryService

class GameSessionViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication] 
    permission_classes = [IsAuthenticated]
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer

    @action(detail=True, methods=['post'])
    def take_action(self, request, pk=None):
        """Unified endpoint for Scavenge, Douse, and Rest."""
        session = self.get_object()
        action_type = request.data.get("action_type") # e.g., "SCAVENGE", "DOUSE", "REST"

        if not action_type:
            return Response({"error": "No action type provided"}, status=400)

        # 1. Execute Game Logic via the Model
        # This updates Grit (Health), Rice, Danger, and segments_left
        summary = session.perform_action(action_type)

        # 2. Check for Game Over
        if session.grit <= 0:
            narration = "The heat becomes a weight you can no longer carry. Your vision fades into a wall of orange flame."
            session.story_log += f"\n\nGAME OVER: {narration}"
            session.save()
            return Response({"status": "DEAD", "narration": narration}, status=200)

        # 3. AI Logic: Generate narration based on the new world state
        # We pass the summary of what happened (e.g., "Scavenged 2 rice") to the AI
        new_narration = StoryService.generate_narration(
            session, action_type, summary
        )

        # 4. Persistence
        session.story_log += f"\n\nDay {session.current_cycle}: {new_narration}"
        session.save()

        return Response({
            "status": "Action Complete",
            "narration": new_narration,
            "grit": session.grit,
            "rice": session.rice,
            "fire_danger": session.fire_danger,
            "segments_left": session.segments_left,
            "current_cycle": session.current_cycle,
            "story_log": session.story_log
        })

    # @action(detail=True, methods=['post'])
    # def scavenge(self, request, pk=None):
    #     session = self.get_object()
        
    #     # 1. Game Logic: Roll the dice
    #     roll_value, success = session.roll_dice(difficulty=10)
        
    #     if success:
    #         session.rice += 2
    #     else:
    #         session.grit -= 1 

    #     # 2. AI Logic: Generate narration
    #     new_narration = StoryService.generate_narration(
    #         session, "scavenge", success, roll_value
    #     )

    #     # 3. Persistence: Append to history
    #     session.story_log += f"\n\nCycle {session.current_cycle}: {new_narration}"
    #     session.current_cycle += 1
    #     session.save()

    #     return Response({
    #         "status": "Scavenged",
    #         "success": success,
    #         "narration": new_narration,
    #         "story_log": session.story_log,
    #         "rice": session.rice,
    #         "grit": session.grit
    #     })

    @action(detail=True, methods=['post'])
    def rest(self, request, pk=None):
        session = self.get_object()
        session.grit += 1
        session.rice -= 1
        session.current_cycle += 1
        session.save()
        return Response({
            "status": "Rested", 
            "grit": session.grit, 
            "rice": session.rice,
            "current_cycle": session.current_cycle
        })

class AllCharacters(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        characters = MainCharacter.objects.order_by("name")
        serializer = MainCharacterSerializer(characters, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MainCharacterSerializer(data=request.data)
        if serializer.is_valid():
            character = serializer.save(user=request.user)
            # Create session automatically
            session, created = GameSession.objects.get_or_create(
                character=character,
                defaults={
                    'rice': 5, 
                    'grit': 100,      # Start with Full Health!
                    'current_cycle': 1,
                    'fire_danger': 10 # Initial small fire
                }
            )
            # this is the prologue story
            prologue = StoryService.generate_prologue(session)
            session.story_log = prologue
            session.save()
            

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    def delete(self, request, pk=None):
        """Deletes a specific character and their associated session."""
        try:
            # Ensure the user can only delete THEIR OWN characters
            character = MainCharacter.objects.get(pk=pk, user=request.user)
            character.delete() 
            return Response({"message": "Character turned to ash."}, status=status.HTTP_204_NO_CONTENT)
        except MainCharacter.DoesNotExist:
            return Response({"error": "Character not found."}, status=status.HTTP_404_NOT_FOUND)