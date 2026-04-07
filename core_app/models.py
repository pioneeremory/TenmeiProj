from django.db import models
from django.conf import settings
import random
from .regions import KYOTO_REGIONS

class MainCharacter(models.Model):
    # 'user' (below) is a foreign key to the User model in Django's built-in authentication system
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="characters" # this allows request.user.characters.all() to grab all user's characters in case of multiple save files I think  
        )
    name = models.CharField(max_length=15)
    is_male = models.BooleanField(default =True)
    is_dead = models.BooleanField(default=False)
    cause_of_death = models.CharField(max_length=255, blank= True, null=True)

    def __str__(self):
        status = " (Deceased)" if self.is_dead == True else ""
        return f"{self.name}{status}"
    def update(self, request, *args, **kwargs):
        character = self.get_object()
        character.name = request.data.get('name', character.name)
        character.save()
        return Response({"message": "Name Updated", "Name": character.name})

class GameSession(models.Model):
    character = models.ForeignKey(MainCharacter, on_delete=models.CASCADE, related_name="game_sessions")
    grit = models.IntegerField(default=100)
    rice = models.IntegerField(default=5)
    current_cycle = models.IntegerField(default=1)
    daily_actions_buffer = models.JSONField(default=list) #added to allow for summaries after each cycle
    
    
    story_log = models.TextField(default="The journey begins in the ashes of Kyoto...")
    
    fire_danger = models.IntegerField(default=10)
    segments_left = models.IntegerField(default=3) # 3 actions per day
    current_region = models.CharField(max_length=50, default="palace_gates")
    
    status = models.CharField(max_length=20, default="ACTIVE") 
    monk_encounters = models.IntegerField(default=0)
    monk_rice_donated = models.IntegerField(default=0)
    met_fox = models.BooleanField(default=False)
    pending_event = models.JSONField(null=True, blank=True) 

    has_monastery_key = models.BooleanField(default=False)
    has_comb = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.character.name} - Cycle {self.current_cycle}"
    def get_available_regions(self):
        # Only return regions where the fire_threshold is NOT met (i.e., lower than current fire)
        return [r for r, data in KYOTO_REGIONS.items() if self.fire_danger < data["fire_threshold"]]

    def roll_dice(self, difficulty: int) -> bool: # this method will be called by the view to update the session's dice rolls and return a boolean value of whether or not the character passes
        roll = random.randint(1,6)
        total_roll = roll + self.grit
        return roll, total_roll >= difficulty
        
    def perform_action(self, action_type):
        """Processes one of the 3 daily segments."""
        if self.segments_left <= 0:
            return "Exhausted! You have no more actions left today."

        self.segments_left -= 1
        summary = ""
        region_id = self.current_region
        region_metadata = KYOTO_REGIONS.get(region_id, {})
        current_region_name = region_metadata.get("name", "Unknown Area")

        if action_type == "SCAVENGE":
            # High reward, high risk to Grit (Health)
            found_rice = random.randint(1, 3)
            grit_loss = random.randint(5, 15)
            self.rice += found_rice
            # self.grit -= grit_loss (changed this because it was going negative!)
            self.grit = max(-100, self.grit - grit_loss)
            summary = f"Scavenged {found_rice} rice but lost {grit_loss} Grit to the heat."

        elif action_type == "DOUSE":
            # Spend Grit to lower the world threat
            self.grit -= 10
            reduction = random.randint(15, 25)
            self.fire_danger = max(0, self.fire_danger - reduction)
            summary = f"Fought the flames, reducing danger by {reduction}%."

        elif action_type == "REST":
            # Heal Grit at the cost of Rice
            if self.rice >= 1:
                self.rice -= 1
                self.grit = min(100, self.grit + 20)
                summary = "Rested and ate, recovering 20 Grit."
            else:
                summary = "Tried to rest without food; grit remained low."

        # Every action makes the fire grow slightly
        self.fire_danger += random.randint(2, 5)
        
        # if self.segments_left == 0:
            # self.resolve_day_end()

        self.daily_actions_buffer.append({
            "segment": 3 - self.segments_left, # 1, 2, or 3
            "action": action_type,
            "region": current_region_name,
            "summary": summary
        })
            
        self.save()
        return summary

    def resolve_day_end(self):
        from .services import EncounterService
        self.current_cycle += 1
        self.segments_left = 3

        new_event = EncounterService.check_for_encounter(self)
        self.pending_event = new_event

        self.fire_danger += 10 
        self.daily_actions_buffer = []
        self.save()
        return f"Day {self.current_cycle} begins. The smoke is thick over Kyoto."

    def mark_character_dead(self, reason):
        char = self.character
        char.is_dead = True
        char.cause_of_death = reason
        char.save()
        
        self.status = "DEAD" 
        self.save()