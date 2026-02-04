# TenmeiProj

This is a personal project that tests my ability to bring together full stack knowledge and limited AI in order to create a web-based LitRPG with high stakes and compelling narrative decisions.

# Django admin

logan, pass

# Build first for your django project:

Models - it's your foundation
Validators - if you have enough, can be none at first
Serializers
Views
Urls

Creating a user via python shell (with your Django super user)

from django.contrib.auth import get_user_model
from core_app.models import MainCharacter
User = get_user_model()
me = User.objects.get(username='your_username_here')
logan = MainCharacter(name='Logan', is_male=True, user=me)
logan.save()
