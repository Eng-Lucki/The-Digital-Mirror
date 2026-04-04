from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_suggest_returns_swatches_and_suggestions():
    response = client.post("/suggest", json={"colors": ["#3a5fa0"]})
    assert response.status_code == 200
    data = response.json()
    assert len(data["swatches"]) == 5
    assert len(data["suggestions"]) == 3


def test_suggest_empty_colors():
    response = client.post("/suggest", json={"colors": []})
    assert response.status_code == 200
    assert response.json() == {"swatches": [], "suggestions": []}
