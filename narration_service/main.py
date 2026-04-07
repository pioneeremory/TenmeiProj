from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import requests
import sys

app = FastAPI() 

class StoryRequest(BaseModel):
    prompt: str

@app.get("/health")
def health():
    return {"status": "alive"}

@app.post("/generate")
async def generate(request: StoryRequest):
    # 🎯 1. Forced Print for Debugging (This will show in Docker logs)
    print(f"RECEIVED REQUEST: {request.prompt}", flush=True)
    sys.stdout.flush()

    system_instruction = "Dark historical novelist, 1788 Kyoto. Exactly 2 sentences."

    try:
        # 🎯 2. Using the bridge to Ollama
        r = requests.post(
            "http://host.docker.internal:11434/api/generate",
            json={
                "model": "llama3.1:latest", 
                "prompt": request.prompt,
                "system": system_instruction, 
                "stream": False
            },
            timeout=60 
        )
        print(f"OLLAMA RESPONSE STATUS: {r.status_code}", flush=True)
        return {"response": r.json().get("response")}
    except Exception as e:
        print(f"!!! OLLAMA CONNECTION ERROR: {e} !!!", flush=True)
        return {"response": f"The spirits are silent. Error: {e}"}