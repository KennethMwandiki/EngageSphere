from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS Middleware configuration for enabling cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, modify to restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage (simple, in-memory)
users = []
campaigns = []

# Data models
class User(BaseModel):
    id: int = None
    name: str
    email: str

class Campaign(BaseModel):
    id: int = None
    name: str

# ---------- User Management APIs ----------
@app.get("/api/users", response_model=List[User])
def get_users():
    return users

@app.post("/api/users", response_model=User)
def create_user(user: User):
    user.id = len(users) + 1
    users.append(user)
    return user

# ---------- Campaign APIs ----------
@app.get("/api/campaigns", response_model=List[Campaign])
def get_campaigns():
    return campaigns

@app.post("/api/campaigns", response_model=Campaign)
def create_campaign(camp: Campaign):
    camp.id = len(campaigns) + 1
    campaigns.append(camp)
    return camp

# ---------- Engagement Tracking ----------
@app.post("/api/engagement")
def log_engagement(data: dict):
    # You can process/store engagement data here
    return {"status": "success", "data": data}

# ---------- Metrics Endpoint ----------
@app.get("/api/metrics")
def get_metrics():
    return {
        "campaigns": len(campaigns),
        "users": len(users)
    }
