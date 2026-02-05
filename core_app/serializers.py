from rest_framework import serializers
from .models import MainCharacter, GameSession

class MainCharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCharacter
        fields = ['id', 'name', 'is_male']

class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = ['id', 'character', 'grit', 'rice', 'current_cycle']