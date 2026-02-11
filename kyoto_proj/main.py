import os
import subprocess
import ollama
from fastapi import FastAPI, Depends, HTTPException, Header
from ollama import Client
from dotenv import load_dotenv

load_dotenv()
API_KEYS = {os.getenv("API_KEY"): 20}

app = FastAPI()

def verify_api_key(x_api_key:str = Header(None)):
    credits = API_KEYS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

# Automatically find the Windows gateway IP if in WSL
def get_wsl_gateway():
    try:
        # Runs the shell command we used earlier
        cmd = "ip route show | grep default | awk '{print $3}'"
        return subprocess.check_output(cmd, shell=True).decode().strip()
    except:
        return "127.0.0.1"

# Initialize the client with the detected gateway
GATEWAY_IP = get_wsl_gateway()
client = Client(host=f"http://{GATEWAY_IP}:11434")


@app.post("/generate")

def generate(prompt: str, x_api_key: str = Depends(verify_api_key)):
    API_KEYS[x_api_key] -= 1 # OPTIONAL this removes api credits upon each request
    response = ollama.chat(model="gpt-oss:20b", messages=[{"role": "user","content": prompt}])
    return {"response": response["message"]["content"]}