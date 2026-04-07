# core_app/services.py
import os
import requests
import random
from .regions import KYOTO_REGIONS

class StoryService:
    @staticmethod
    def generate_prologue(session):
        AI_SERVICE_URL = os.environ.get("NARRATION_SERVICE_URL", "http://narration:8001/generate")
        # "http://127.0.0.1:8001/generate"
        API_KEY = os.environ.get("NARRATION_API_KEY", "dev-key")
        
        # Determine sibling term based on character choice. This is purely for flavor/ context to the AI.
        sibling = "sister" if session.character.is_male else "brother"
        
        prompt = (
            f"Write the opening narrative for a survival game. "
            f"MANDATORY STARTING TEXT: 'The time is 1788, and the Great Fire of Kyoto rages on. "
            f"Japan has angered the kami, and for this is an infernal punishment on what was once "
            f"a great city of thousands. All but your little {sibling} remain, can you put the pieces back together?'\n\n"
            f"TASK: Follow that text with a vivid, grim description of the Kamo River choked with ash "
            f"and the sky glowing red over the Gosho Palace. "
            f"Then, explain the rules of this hell: Rice is your lifeblood, Grit is your physical and mental. make the words 'Rice', 'Grit', and 'Fire Hazard' bold and italics.\n\n"
            f"will to survive, and the Fire Hazard is the wrath of the gods that will consume everything if ignored. "
            f"Style: Historical, atmospheric, and captivating."
            f"STYLE RULE: Explain the game mechanics within the story: **Rice** is your lifeblood, **Grit** is your will to survive, and the **Fire Hazard** will consume everything. You MUST use bold markdown (e.g., **Rice**) for these three key terms."
        )

        try:
            response = requests.post(
                AI_SERVICE_URL,
                json={"prompt": prompt}, 
                headers={"x-api-key": API_KEY},
                timeout=40 
            )
            return response.json().get("response")
        except Exception as e:
            print(f"Prologue Error: {e}")
            return "The city of Kyoto burns in silence. Your journey begins in the smoke."
    @staticmethod
    def generate_narration(session, action_type, summary):
        AI_SERVICE_URL = os.getenv("NARRATION_SERVICE_URL", "http://narration:8001/generate")
        API_KEY = os.getenv("NARRATION_API_KEY", "secretkey") 

        region_id = session.current_region
        region_metadata = KYOTO_REGIONS.get(region_id, {})
        current_region_name = region_metadata.get("name", "an Unknown Area")

        # Context for AI about the region
        region_ai_description = f"This is an unlocked area where the fire threshold is {region_metadata.get('fire_threshold')}%."
        
        # Contextual Memory 
        context = session.story_log[-500:] if session.story_log else "The journey begins in the ashes."

        # Construct the Prompt 
        prompt = (
            f"Context: {context}\n"
            f"Setting: 1788 Kyoto Great Fire. Style: Dark Historical LitRPG.\n"
            f"Current Location: {current_region_name} (Status: {region_ai_description}).\n"
            f"Character: {session.character.name} (Grit: {session.grit}, Rice: {session.rice}, Fire Danger: {session.fire_danger}%).\n"
            f"Action Taken: {action_type}.\n"
            f"Outcome: {summary}.\n"
            f"Requirement: Write exactly 2 sentences of sensory, grim narration. Stay in the 1788 timeline. Don't repeat yourself."
        )

        try:
            # 4. The Request to FastAPI
            response = requests.post(
                AI_SERVICE_URL,
                json={"prompt": prompt}, 
                headers={"x-api-key": API_KEY},
                timeout=30 
            )
            
            if response.status_code == 200:
                return response.json().get("response", "The fire roars, leaving you speechless.")
            
            return f"The record fades... (Status: {response.status_code})"
            
        except Exception as e:
            print(f"AI Bridge Error: {e}")
            return "The spirits of Kyoto are silent. (Check if FastAPI/Ollama is running)"

import random

class EncounterService:
    @staticmethod
    def check_for_encounter(session):
        day = session.current_cycle

        # 1. FIXED STORY EVENTS (The Monk)
        if day in [3, 7, 10] and session.monk_encounters < 3:
            session.monk_encounters += 1
            session.save()
            return {
                "id": "MONK_APPEARS",
                "npc": "The Ragged Monk",
                "title": "A Plea for Shokokuji",
                "text": "A monk with a scorched hem to his robe stops you. 'The Great Fire nears the temple archives. We need rice to feed the volunteers. Can you spare a grain?'",
                "options": [
                    {"label": "Give 1 Rice", "value": "GIVE_RICE", "disabled": session.rice < 1},
                    {"label": "Ignore him", "value": "IGNORE"}
                ]
            }

        # 2. FIXED STORY EVENTS (The Fox)
        if day == 15 and not session.met_fox:
            session.met_fox = True
            session.save()
            return {
                "id": "FOX_BARGAIN",
                "npc": "Mysterious Woman",
                "title": "The Kitsune's Smile",
                "text": "A woman stands untouched by the ash, her eyes glowing amber. 'I can blow the embers away from your path... for a price.'",
                "options": [
                    {"label": "Accept (Fire -30%, Rice -5)", "value": "ACCEPT_FOX", "disabled": session.rice < 5},
                    {"label": "Refuse (Grit -20)", "value": "REFUSE_FOX"}
                ]
            }

        # 3. RANDOM WORLD EVENTS
        roll = random.randint(1, 100)

        # 10% Chance: Warrior Tax
        if roll <= 10:
            return {
                "id": "WARRIOR_TAX",
                "npc": "Bushi Patrol",
                "title": "The Tax of Steel",
                "text": "Two warriors block the charred alleyway. 'All who pass the market must contribute to the city guard.'",
                "options": [
                    {"label": "Pay 2 Rice", "value": "PAY_TAX", "disabled": session.rice < 2},
                    {"label": "Refuse (Risk injury)", "value": "REFUSE_TAX"}
                ]
            }
        
        # 5% Chance: Rare Item
        elif 11 <= roll <= 15:
            return {
                "id": "BEAUTIFUL_COMB",
                "npc": "None",
                "title": "A Flicker of Beauty",
                "text": "Amidst the grey ash, you find a lacquered tortoise-shell comb. It reminds you that beauty still exists.",
                "options": [
                    {"label": "Take it (+10 Grit)", "value": "TAKE_COMB"}
                ]
            }

        return None # No event today