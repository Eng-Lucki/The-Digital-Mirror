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


import io as _io
from PIL import Image as _Image


def _make_png_bytes():
    img = _Image.new("RGB", (20, 20), color=(100, 150, 200))
    buf = _io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_upload_returns_png_with_valid_image():
    response = client.post(
        "/upload",
        files={"file": ("test.png", _make_png_bytes(), "image/png")},
        data={"type": "shirt"},
    )
    assert response.status_code == 200
    assert "image/png" in response.headers["content-type"]
