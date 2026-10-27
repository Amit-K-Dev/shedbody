from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import os
import hmac
from typing import Optional

app = FastAPI()

INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET")
NEXT_API_URL = os.getenv("NEXT_INTERNAL_URL", "http://127.0.0.1:3000")
PYTHON_API_SECRET = os.getenv("PYTHON_API_SECRET")
ENVIRONMENT = os.getenv("ENVIRONMENT", os.getenv("NODE_ENV", "development")).lower()

def _check_production_secrets():
    """Ensure required secrets are present in production/staging environments."""
    if ENVIRONMENT in ("production", "staging"):
        missing = []
        if not INTERNAL_SECRET:
            missing.append("INTERNAL_API_SECRET")
        if not PYTHON_API_SECRET:
            missing.append("PYTHON_API_SECRET")
        if missing:
            raise RuntimeError(f"Missing required secrets for Python Service in {ENVIRONMENT}: {', '.join(missing)}")

_check_production_secrets()

def _verify_bearer(authorization: Optional[str], expected_secret: Optional[str], detail: str = "Unauthorized"):
    """
    Validate Authorization Bearer token using constant-time comparison.
    Fails closed immediately if expected_secret is unconfigured or token is invalid.
    """
    if not expected_secret:
        raise HTTPException(status_code=401, detail="Service authentication unconfigured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail=detail)
    token = authorization.split("Bearer ", 1)[1].strip()
    if not hmac.compare_digest(token, expected_secret):
        raise HTTPException(status_code=401, detail=detail)

class GoalAnalyticsRequest(BaseModel):
    user_id: str
    target_value: float
    start_value: float

class AiCoachRequest(BaseModel):
    user_id: str
    question: str
    intent: Optional[str] = None

@app.post("/api/v1/coach/orchestrate")
def orchestrate_ai_coach(req: AiCoachRequest, authorization: str = Header(None)):
    _verify_bearer(authorization, PYTHON_API_SECRET, detail="Unauthorized")

    from python_service.orchestration.ai_coach import process_ai_coach_request
    response_dict, status_code = process_ai_coach_request(
        user_id=req.user_id,
        question=req.question,
        intent=req.intent
    )
    return JSONResponse(status_code=status_code, content=response_dict)

@app.post("/api/python/analytics/goal-projection")
async def calculate_goal_projection(req: GoalAnalyticsRequest, authorization: str = Header(None)):
    _verify_bearer(authorization, INTERNAL_SECRET, detail="Unauthorized Python Boundary")
    
    diff = abs(req.start_value - req.target_value)
    weeks_to_goal = diff / 0.5
    days_to_goal = int(weeks_to_goal * 7)
    
    return {
        "user_id": req.user_id,
        "projected_days": days_to_goal,
        "message": f"At a healthy rate, it will take ~{days_to_goal} days to reach {req.target_value}.",
        "engine": "python-analytics-v1"
    }

@app.get("/api/v1/analytics/weight-trend")
async def get_weight_trend(
    user_id: str = Query(...), 
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    authorization: str = Header(None)
):
    _verify_bearer(authorization, INTERNAL_SECRET, detail="Unauthorized Python Boundary")
    
    if not INTERNAL_SECRET:
        raise HTTPException(status_code=500, detail="Missing INTERNAL_API_SECRET for upstream authentication")

    # Securely request raw data from the transactional layer
    headers = {"Authorization": f"Bearer {INTERNAL_SECRET}"}
    params = {"user_id": user_id}
    if start_date: params["start_date"] = start_date
    if end_date: params["end_date"] = end_date

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NEXT_API_URL}/api/internal/metrics", 
                params=params,
                headers=headers
            )
            response.raise_for_status()
            data = response.json().get("data", [])
    except httpx.HTTPStatusError as e:
        detail = "Failed to retrieve data from transactional layer"
        try:
            err_json = e.response.json()
            if "error" in err_json:
                detail = err_json["error"]
        except:
            pass
        raise HTTPException(status_code=e.response.status_code, detail=detail)
    except httpx.RequestError as e:
        print(f"Error fetching data from internal API: {e}")
        raise HTTPException(status_code=502, detail="Failed to retrieve data from transactional layer")

    # Filter out empty weight entries and ensure sorted by date
    valid_entries = [d for d in data if d.get("weight") is not None]
    valid_entries.sort(key=lambda x: x["entry_date"])

    if not valid_entries:
        return _empty_trend()

    current_entry = valid_entries[-1]
    current_weight = float(current_entry["weight"])

    if len(valid_entries) == 1:
        return {
            "current": current_weight,
            "previous": None,
            "change": None,
            "percentageChange": None,
            "direction": "flat",
            "rateOfChange": None,
            "points": [{"date": current_entry["entry_date"], "value": current_weight}],
            "rolling_average_7d": current_weight
        }

    previous_entry = valid_entries[-2]
    previous_weight = float(previous_entry["weight"])

    change = round(current_weight - previous_weight, 2)
    percentage_change = round((change / previous_weight) * 100, 2) if previous_weight > 0 else 0

    direction = "flat"
    if change > 0:
        direction = "up"
    elif change < 0:
        direction = "down"

    rate_of_change = None
    from datetime import datetime
    try:
        d1 = datetime.strptime(previous_entry["entry_date"][:10], "%Y-%m-%d")
        d2 = datetime.strptime(current_entry["entry_date"][:10], "%Y-%m-%d")
        duration_days = (d2 - d1).days
        if duration_days > 0:
            rate_of_change = round(change / duration_days, 4)
    except ValueError:
        pass

    # Calculate 7-day rolling average (simple average of last 7 valid points)
    last_7 = valid_entries[-7:]
    rolling_avg = round(sum(float(x["weight"]) for x in last_7) / len(last_7), 2)

    points = [{"date": x["entry_date"], "value": float(x["weight"])} for x in valid_entries]

    return {
        "current": current_weight,
        "previous": previous_weight,
        "change": change,
        "percentageChange": percentage_change,
        "direction": direction,
        "rateOfChange": rate_of_change,
        "points": points,
        "rolling_average_7d": rolling_avg
    }

def _empty_trend():
    return {
        "current": None,
        "previous": None,
        "change": None,
        "percentageChange": None,
        "direction": "flat",
        "rateOfChange": None,
        "points": [],
        "rolling_average_7d": None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
