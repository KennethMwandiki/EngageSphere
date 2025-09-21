from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS setup for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for testing, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Storage
users = []
campaigns = []
forum_posts = []
talent_list = []
feedback_list = []
language_pref = "en"

# Models
class User(BaseModel):
    id: int
    name: str
    email: str

class UserCreate(BaseModel):
    name: str
    email: str

class Campaign(BaseModel):
    id: int
    name: str

class CampaignCreate(BaseModel):
    name: str

class ForumPost(BaseModel):
    user: str = "Anonymous"
    text: str

class Talent(BaseModel):
    name: str
    skills: str

class Feedback(BaseModel):
    text: str

# Users endpoints
@app.get("/api/users", response_model=List[User])
def get_users():
    return users

@app.post("/api/users", response_model=User)
def create_user(user: UserCreate):
    new_user = User(id=len(users) + 1, name=user.name, email=user.email)
    users.append(new_user)
    return new_user

# Campaign endpoints
@app.get("/api/campaigns", response_model=List[Campaign])
def get_campaigns():
    return campaigns

@app.post("/api/campaigns", response_model=Campaign)
def create_campaign(camp: CampaignCreate):
    new_camp = Campaign(id=len(campaigns) + 1, name=camp.name)
    campaigns.append(new_camp)
    return new_camp

# Engagement logging
@app.post("/api/engagement")
def log_engagement(data: dict):
    # For demo, just return success
    return {"status": "success", "data": data}

# Metrics
@app.get("/api/metrics")
def get_metrics():
    return {
        "campaigns": len(campaigns),
        "users": len(users)
    }

# Add endpoint for profile update (simulated)
@app.post("/api/profile")
def update_profile(data: dict):
    # For demo, just return success
    return {"status": "success", "data": data}

# Analytics
@app.get("/api/market-analytics")
def market_analytics():
    return {"labels": ["Americas", "Europe", "Asia"], "values": [120, 95, 110]}

@app.get("/api/sentiment-analytics")
def sentiment_analytics():
    return [60, 25, 15] # positive, neutral, negative

# Forum
@app.get("/api/forum")
def get_forum():
    return forum_posts

@app.post("/api/forum")
def post_forum(post: ForumPost):
    forum_posts.append(post)
    return {"status": "success"}

# Talent
@app.get("/api/talent")
def get_talent():
    return talent_list

@app.post("/api/talent")
def post_talent(talent: Talent):
    talent_list.append(talent)
    return {"status": "success"}

# Co-Creation
@app.get("/api/feedback")
def get_feedback():
    return feedback_list

@app.post("/api/feedback")
def post_feedback(feedback: Feedback):
    feedback_list.append(feedback)
    return {"status": "success"}

# Live Interaction
@app.get("/api/live/{platform}")
def live_interaction(platform: str):
    return {"status": f"Started {platform} session (simulated)"}

# A/B Testing
@app.get("/api/abtest")
def ab_test():
    return {"summary": "A/B Test complete. Variant A: 52%, Variant B: 48%"}

# Language
@app.post("/api/language")
def set_language(data: dict):
    global language_pref
    language_pref = data.get("lang", "en")
    return {"status": "success"}

# Legal/IP Notice
@app.get("/api/legal")
def legal():
    return {"notice": "© 2024 Ken's Digital Hub. All rights reserved. EngageSphere is protected by copyright, trademark, and patent law."}

# Entrypoint for running with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
