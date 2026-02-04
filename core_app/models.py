from django.db import models
import random

class MainCharacter(models.Model):
    # 'user' (below) is a foreign key to the User model in Django's built-in authentication system
    user = models.ForeignKey(
    settings.AUTH_USER_MODEL, 
    on_delete=models.CASCADE, 
    related_name="characters" # this allows request.user.characters.all() to grab all user's characters in case of multiple save files I think
)
    name = models.CharField(max_length=15)
    is_male = models.BooleanField()

    def __str__(self):
        return self.name

    def create(self, name: str, is_male: bool):
        MainCharacter.objects.create(name=name, is_male=is_male)

class GameSession(models.Model):
    character = models.ForeignKey(MainCharacter, on_delete=models.CASCADE)
    grit = models.IntegerField(default=1)
    rice = models.IntegerField(default=0)
    current_cycle = models.IntegerField(default=1)

    def roll_dice(self, difficulty: int) -> bool: # this method will be called by the view to update the session's dice rolls and return a boolean value of whether or not the character passes
        roll = random.randint(1,6)
        total_roll = roll + self.grit
        return total_roll >= difficulty