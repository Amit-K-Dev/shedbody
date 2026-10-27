import os
os.environ["ENVIRONMENT"] = "test"
os.environ["INTERNAL_API_SECRET"] = "test-internal-secret-for-analytics"
os.environ["PYTHON_API_SECRET"] = "test-python-secret-for-analytics"

import pytest
from fastapi.testclient import TestClient
from app import app, INTERNAL_SECRET
import httpx
import respx

client = TestClient(app)

@pytest.fixture
def mock_next_api():
    with respx.mock(base_url="http://127.0.0.1:3000") as respx_mock:
        yield respx_mock

def test_unauthorized():
    # Missing authorization header
    response = client.get("/api/v1/analytics/weight-trend?user_id=123")
    assert response.status_code == 401

    # Wrong secret
    response = client.get(
        "/api/v1/analytics/weight-trend?user_id=123",
        headers={"Authorization": "Bearer wrong-secret"}
    )
    assert response.status_code == 401

def test_missing_user_id():
    response = client.get(
        "/api/v1/analytics/weight-trend",
        headers={"Authorization": f"Bearer {INTERNAL_SECRET}"}
    )
    assert response.status_code == 422 # FastAPI validation error for missing query param

def test_normal_data(mock_next_api):
    # Mock Next.js internal API response
    mock_data = {
        "data": [
            {"weight": 80.0, "entry_date": "2024-01-01"},
            {"weight": 79.5, "entry_date": "2024-01-02"},
            {"weight": 79.0, "entry_date": "2024-01-03"},
        ]
    }
    route = mock_next_api.get("/api/internal/metrics?user_id=123").respond(json=mock_data)

    response = client.get(
        "/api/v1/analytics/weight-trend?user_id=123",
        headers={"Authorization": f"Bearer {INTERNAL_SECRET}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["current"] == 79.0
    assert data["previous"] == 79.5
    assert data["change"] == -0.5
    assert data["direction"] == "down"
    assert data["rolling_average_7d"] == 79.5 # (80.0+79.5+79.0)/3 = 79.5

def test_empty_data(mock_next_api):
    mock_data = {"data": []}
    mock_next_api.get("/api/internal/metrics?user_id=123").respond(json=mock_data)

    response = client.get(
        "/api/v1/analytics/weight-trend?user_id=123",
        headers={"Authorization": f"Bearer {INTERNAL_SECRET}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["current"] is None
    assert data["direction"] == "flat"

def test_single_data_point(mock_next_api):
    mock_data = {"data": [{"weight": 80.0, "entry_date": "2024-01-01"}]}
    mock_next_api.get("/api/internal/metrics?user_id=123").respond(json=mock_data)

    response = client.get(
        "/api/v1/analytics/weight-trend?user_id=123",
        headers={"Authorization": f"Bearer {INTERNAL_SECRET}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["current"] == 80.0
    assert data["previous"] is None
    assert data["change"] is None

def test_malformed_input(mock_next_api):
    # What if Next.js returns data with missing weights or bad format?
    mock_data = {
        "data": [
            {"entry_date": "2024-01-01"}, # missing weight
            {"weight": 80.0, "entry_date": "2024-01-02"},
        ]
    }
    mock_next_api.get("/api/internal/metrics?user_id=123").respond(json=mock_data)

    response = client.get(
        "/api/v1/analytics/weight-trend?user_id=123",
        headers={"Authorization": f"Bearer {INTERNAL_SECRET}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["current"] == 80.0
    # Treated as single data point since missing weight is filtered
    assert data["previous"] is None

def test_next_api_failure(mock_next_api):
    mock_next_api.get("/api/internal/metrics?user_id=123").respond(status_code=500)

    response = client.get(
        "/api/v1/analytics/weight-trend?user_id=123",
        headers={"Authorization": f"Bearer {INTERNAL_SECRET}"}
    )
    assert response.status_code == 500
    assert "Failed to retrieve data" in response.json()["detail"]

def test_rejection_of_deprecated_fallbacks():
    # Authenticating with the old hardcoded strings MUST fail 401
    response = client.get(
        "/api/v1/analytics/weight-trend?user_id=123",
        headers={"Authorization": "Bearer internal-python-secret-key-123"}
    )
    assert response.status_code == 401

    response = client.post(
        "/api/python/analytics/goal-projection",
        json={"user_id": "123", "target_value": 70.0, "start_value": 80.0},
        headers={"Authorization": "Bearer internal-python-secret-key-123"}
    )
    assert response.status_code == 401

    response = client.post(
        "/api/v1/coach/orchestrate",
        json={"user_id": "123", "question": "test"},
        headers={"Authorization": "Bearer python-secret-key-123"}
    )
    assert response.status_code == 401

def test_missing_server_secret_fails_closed():
    from app import _verify_bearer
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        _verify_bearer("Bearer any-secret", None)
    assert exc_info.value.status_code == 401

def test_production_startup_fails_closed():
    import subprocess
    import sys
    env = os.environ.copy()
    env["ENVIRONMENT"] = "production"
    env.pop("INTERNAL_API_SECRET", None)
    env.pop("PYTHON_API_SECRET", None)
    res = subprocess.run(
        [sys.executable, "-c", "import app"],
        cwd=os.path.dirname(__file__),
        env=env,
        capture_output=True,
        text=True
    )
    assert res.returncode != 0
    assert "Missing required secrets" in res.stderr

    

