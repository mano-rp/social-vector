"""Tests for FastAPI backend analytical endpoints."""

from starlette.testclient import TestClient
from social_vector.server.app import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SocialVector" in data["service"]


def test_start_and_poll_analysis():
    response = client.post(
        "/api/analysis",
        json={
            "dataset_id": "datasets/sample_coordinated_campaign.json",
            "scope": "dataset",
            "threshold": 0.75,
            "eps": 0.38,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    analysis_id = data["analysis_id"]

    # Poll status
    status_resp = client.get(f"/api/analysis/{analysis_id}")
    assert status_resp.status_code == 200
