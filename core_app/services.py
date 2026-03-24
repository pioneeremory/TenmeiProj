# core_app/services.py
import requests

class StoryService:
    @staticmethod
    def generate_prologue(session):
        AI_SERVICE_URL = "http://127.0.0.1:8001/generate"
        API_KEY = "secretkey"
        
        # Determine sibling term based on character choice
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
        # 1. Configuration (Bridge to your 7900 XTX)
        AI_SERVICE_URL = "http://127.0.0.1:8001/generate" 
        API_KEY = "secretkey" 
        
        # 2. Contextual Memory (Preserve the last 500 characters of the story)
        context = session.story_log[-500:] if session.story_log else "The journey begins in the ashes."

        # 3. Construct the Prompt (The "Brain" for the 7900 XTX)
        # We replace 'success/roll' with the 'summary' from the model logic
        prompt = (
            f"Context: {context}\n"
            f"Setting: 1788 Kyoto Great Fire. Style: Dark Historical LitRPG.\n"
            f"Character: {session.character.name} (Grit: {session.grit}, Rice: {session.rice}, Fire Danger: {session.fire_danger}%).\n"
            f"Action Taken: {action_type}.\n"
            f"Outcome: {summary}.\n"
            f"Requirement: Write exactly 2 sentences of sensory, grim narration. Stay in the 1788 timeline."
        )

        try:
            # 4. The Request to FastAPI
            response = requests.post(
                AI_SERVICE_URL,
                json={"prompt": prompt}, 
                headers={"x-api-key": API_KEY},
                timeout=30 # 7900 XTX is fast, but let's be safe
            )
            
            if response.status_code == 200:
                return response.json().get("response", "The fire roars, leaving you speechless.")
            
            return f"The record fades... (Status: {response.status_code})"
            
        except Exception as e:
            print(f"AI Bridge Error: {e}")
            return "The spirits of Kyoto are silent. (Check if FastAPI/Ollama is running)"