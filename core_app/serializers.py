from rest_framework import serializers
from .models import MainCharacter

class MainCharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCharacter
        fields = ['id', 'name', 'is_male']