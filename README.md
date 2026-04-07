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

Starting the dev app:

1. docker compose up -d
2. python manage.py runserver
3. npm run dev

# Dev logs

1.3

- added DELETE method to characters (only PUT remaining to implement)
- updated the initial game state to include a prologue before the first cycle starts & applied Typewriter effect
- added styling to fire risk @ right sidebar
- refactored GameDash/ History log to dynamically adjust with useEffect, based on previous logs

# TO DO LIST

x MAJOR change, add a world state that recalls the user choices, where they are at in the story, and serves consequences via AI

- Add WIN state, or end game sequences based on challenges or survival (30 cycles + fire intensity determines the degree of success?)
  x The summary of outcomes should appear on the FE after each cycle (not action)
- Add longer format cut scenes to break up the repetitive gameplay?
- Actions that acknowledge the struggles surrounding the user, sometimes with no good choice (feed your starving sibling)
  x Add more acknowledgements to the end of each cycle/ cost of actions
  x Need to add a game state that can be saved and loaded
  x Store previous user actions, inventory, state as context for the AI to narrate from
- Paginate the character select screen
- Style the logout screen
  x Logged in user should only see the characters they own (not all)
  x Add a root page
  x Add an encounter system to curate the story a bit and break up the repetitive AI-driven narrative (Fixed cycle and special events)
- Make quest rewards more meaningful (Monk new location)
- Add more content and events based on the sibling's health and status
  x Visualize the death condition in the character selection screen
- Add Camp visual for summary screens (0/3 segments remain)

How can I use my AI API in order to not just deliver story text when a user takes an action, but also to ask questions or to make their choice feel like it has more weight? Right now it feels cheap when you click the buttons, although the consequences are there. For instance, clicking scavenge might get you some rice, but cost grit (health) AND allow the fire to rage, unchecked.

what if we create regions throughout the city that become unlocked as the fire is put out, or when certain game criteria are met? That way the user can 'navigate' to new scenes to spend their action points to drive certain narratives?

The user must fight the fire throughout each region, else it becomes overtaken by flames?

Story begins purely as a survivalist scenario where you need to meet basic necessities and then it branches out to you helping others, and fighting the fire as the BIG goal. But you need to balance that altruism with the dire needs of your sick sibling, who always seems to need the most help when you can least afford it.
