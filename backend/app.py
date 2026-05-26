from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Rollercoin Market & Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "market_data.json")
BEARER_TOKEN = os.getenv("BEARER_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

class Miner(BaseModel):
    name: str
    id: str
    level: int
    power: float
    bonus: float
    price: float

@app.get("/")
def read_root():
    return {"message": "API is running on port 8001"}


@app.post("/api/upload")
async def upload_data(data: List[Miner]):
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump([m.dict() for m in data], f, indent=4, ensure_ascii=False)
        return {"success": True, "message": f"Saved {len(data)} miners"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/miners")
async def get_miners():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search_user")
async def search_user(request_data: dict):
    username = request_data.get('username')
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    profile_url = f"https://rollercoin.com/api/profile/public-user-profile-data/{username}"
    
    try:
        p_resp = requests.get(profile_url, headers=HEADERS, timeout=10)
        if p_resp.status_code != 200:
            return {"success": False, "error": f"User not found (Status: {p_resp.status_code})"}
        
        p_data = p_resp.json().get("data", {})
        user_id = p_data.get("avatar_id")
        
        if not user_id:
            return {"success": False, "error": "User ID not found."}
        
        room_url = f"https://rollercoin.com/api/game/room-config/{user_id}"
        room_resp = requests.get(room_url, headers=HEADERS, timeout=10)
        
        power_url = f"https://rollercoin.com/api/profile/user-power-data/{user_id}"
        power_resp = requests.get(power_url, headers=HEADERS, timeout=10)
        max_power = 0
        current_power = 0
        if power_resp.status_code == 200:
            power_data = power_resp.json().get("data", {})
            max_power = power_data.get("max_power", 0)
            current_power = power_data.get("current_power", 0)

        return {
            "success": True, 
            "profile": p_data, 
            "max_power": max_power,
            "current_power": current_power,
            "room_data": room_resp.json().get("data", {}) if room_resp.status_code == 200 else {}
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
