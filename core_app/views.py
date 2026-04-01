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


# I need to check if this is secure
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
        if session.grit <= 0 or session.fire_danger >= 100:
            failure_reason = "The smoke filled your lungs until there was no room left for air."
            if action_type == "REST" and session.rice <= 0:
                failure_reason = "You closed your eyes to rest, but with an empty stomach, your body simply lacked the strength to wake up again."
            elif action_type == "SCAVENGE":
                failure_reason = "In your desperation for supplies, you ventured too deep into the inferno. The heat was unforgiving."
            elif action_type == "DOUSE":
                failure_reason = "You fought the flames until your hands blistered and your spirit broke. The fire has won this day."

            session.story_log += f"\n\nGAME OVER: {failure_reason}"
            session.save()
            return Response({
                "status": "DEAD", 
                "narration": failure_reason,
                "failure_reason": failure_reason,
                "grit": session.grit,
                "rice": session.rice,
                "fire_danger": session.fire_danger,
                "story_log": session.story_log
            }, status=200)

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
            "story_log": session.story_log,
            "daily_actions_buffer":session.daily_actions_buffer
        })
    @action(detail=True, methods=['post'])
    def end_day(self, request, pk=None):
        session = self.get_object()
        
        if session.segments_left > 0:
            return Response({"error": "The sun hasn't set yet."}, status=400)

        # Call the logic to reset segments and increment day
        session.resolve_day_end() 
        
        return Response({
            "status": "Day Ended",
            "current_cycle": session.current_cycle,
            "segments_left": session.segments_left,
            "fire_danger": session.fire_danger, # Added so the bar updates
            "event": session.pending_event,
            "daily_actions_buffer": [] # Cleared for the new day
        })
    @action(detail=True, methods=['post'])
    def resolve_event(self, request, pk=None):
        session = self.get_object()
        choice = request.data.get("choice")

        # Defensive check
        if not session.pending_event:
            return Response({"error": "No pending event"}, status=400)

        event_id = session.pending_event.get("id")
        result_text = ""

        # LOGIC FOR RESOLVING THE MONK
        if event_id == "MONK_APPEARS":
            if choice == "GIVE_RICE":
                session.rice -= 1
                session.monk_rice_donated += 1
                result_text = "You handed over the rice. The monk bowed deeply."
            else:
                result_text = "You turned away. The monk's sigh was lost in the wind."

        # LOGIC FOR RESOLVING THE WARRIOR TAX
        elif event_id == "WARRIOR_TAX":
            if choice == "PAY_TAX":
                session.rice -= 2
                result_text = "You paid the tribute. They let you pass."
            else:
                session.grit -= 20
                result_text = "They struck you for your defiance. Your ribs ache."

        # LOGIC FOR THE COMB
        elif event_id == "BEAUTIFUL_COMB":
            session.grit = min(100, session.grit + 10)
            result_text = "The comb feels warm in your hand. You feel a surge of Grit."

        # CLEAN UP
        session.pending_event = None # Clear it so buttons disappear
        session.story_log += f"\n\nENCOUNTER: {result_text}"
        session.save()

        return Response({
            "result_text": result_text,
            "rice": session.rice,
            "grit": session.grit,
            "fire_danger": session.fire_danger,
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

    # @action(detail=True, methods=['post'])
    # def rest(self, request, pk=None):
    #     session = self.get_object()
    #     session.grit += 1
    #     session.rice -= 1
    #     session.current_cycle += 1
    #     session.save()
    #     return Response({
    #         "status": "Rested", 
    #         "grit": session.grit, 
    #         "rice": session.rice,
    #         "current_cycle": session.current_cycle
    #     })

class AllCharacters(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # characters = MainCharacter.objects.order_by("name")
        characters = MainCharacter.objects.filter(user=request.user).order_by("name")
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