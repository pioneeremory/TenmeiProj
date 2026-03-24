# # /home/logan/TenmeiProj/main.py
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI() # <--- THIS is what Uvicorn is looking for!

class StoryRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate(request: StoryRequest, x_api_key: str = Header(None)):
    if x_api_key != "secretkey":
        raise HTTPException(status_code=401, detail="Invalid Key")

    # This "system" instruction forces the AI into "Author Mode"
    system_instruction = (
        "You are a dark historical novelist. You are narrating a LitRPG set in 1788 Kyoto "
        "during the Great Tenmei Fire. Use sensory details: cedar smoke, falling tiles, "
        "and the orange glow of the horizon. Keep narrations to exactly 2 sentences."
    )

    r = requests.post("http://172.21.192.1:11434/api/generate",
                     json={
                         "model": "llama3.1", # Ensure this matches what you pull
                         "prompt": request.prompt,
                         "system": system_instruction, # 📍 ADD THIS LINE
                         "stream": False,
                         "options": {
                             "temperature": 0.8, # Makes it more creative
                             "top_p": 0.9
                         }
                     })
    
    return {"response": r.json().get("response")}