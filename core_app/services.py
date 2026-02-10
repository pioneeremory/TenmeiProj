# This is how my game will serve a narrative story that matches the cycle # and the user decision made in each session.

# core_app/services.py

class StoryService:
    @staticmethod
    def generate_narration(session, action_type, success, roll_value):
        """
        Eventually, this will call an LLM API. 
        For now, it returns a template based on the game state.
        """
        character_name = session.character.name
        
        if action_type == "scavenge":
            if success:
                return f"{character_name} braved the smoke and found a hidden stash of rice! (Roll: {roll_value})"
            else:
                return f"{character_name} searched the ruins, but the heat was too intense. They found nothing. (Roll: {roll_value})"
        
        elif action_type == "rest":
            return f"{character_name} took a moment to breathe in a quiet alleyway, hardening their resolve."
            
        return "The fire rages on..."