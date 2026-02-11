# This is how my game will serve a narrative story that matches the cycle # and the user decision made in each session.

# core_app/services.py
import requests

class StoryService:
    @staticmethod
    def generate_narration(session, action_type, success, roll_value):
        # Point to your FastAPI URL (Ensure this port doesn't clash with Django)
        AI_SERVICE_URL = "http://127.0.0.1:8001/generate" 
        
        # Construct a prompt that gives the AI 'LitRPG' context
        prompt = (
            f"Context: 1788 Kyoto Great Fire. Style: Historical LitRPG. "
            f"Character: {session.character.name} (Grit: {session.grit}, Rice: {session.rice}). "
            f"Action Attempted: {action_type}. "
            f"Outcome: {'SUCCESS' if success else 'FAILURE'} (Roll: {roll_value}). "
            f"Requirement: Write a 1-sentence atmospheric description of this result."
        )

        try:
            # We use 'params' because your FastAPI 'generate' function expects 'prompt' as a query param
            response = requests.post(
                AI_SERVICE_URL,
                params={"prompt": prompt},
                headers={"x-api-key": "secretkey"},
                timeout=15 # LLMs can be slow; don't let Django hang forever
            )
            
            if response.status_code == 200:
                return response.json().get("response")
            return "The roar of the fire drowns out the details of your journey."
        except Exception as e:
            return f"The spirits of Kyoto are silent. (Connection Error)"