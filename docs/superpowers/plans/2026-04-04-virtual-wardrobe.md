# Virtual Wardrobe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a competition showcase 3D Virtual Wardrobe — upload clothing images, strip backgrounds, map as textures onto a procedural 3D mannequin, and get color-harmony outfit suggestions.

**Architecture:** Monorepo with two services: a React + Three.js frontend (Vite) deployed to Vercel, and a FastAPI backend deployed to Render. Frontend manages all state in-memory (no database). Backend is stateless — processes images and runs color logic on each request.

**Tech Stack:** React 18, Three.js, Tailwind CSS, Vite, Vitest, @testing-library/react (frontend) · FastAPI, rembg, Pillow, pytest (backend) · color-thief-browser for client-side color extraction.

---

## File Map

```
cloths/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                          # Vite + vitest config
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── test-setup.js                       # @testing-library/jest-dom import
│       ├── App.jsx                             # Root, three-column layout
│       ├── main.jsx
│       ├── index.css                           # Tailwind directives
│       ├── services/
│       │   └── api.js                          # uploadClothing(), getSuggestions()
│       ├── hooks/
│       │   ├── useMannequin.js                 # gender, scaleX, scaleY state
│       │   ├── useWardrobe.js                  # items array state
│       │   └── __tests__/
│       │       ├── useMannequin.test.js
│       │       └── useWardrobe.test.js
│       └── components/
│           ├── Viewer3D/
│           │   ├── scene.js                    # renderer, camera, lights, OrbitControls
│           │   ├── mannequin.js                # createMannequin(), applyTexture(), setScale()
│           │   └── Viewer3D.jsx                # canvas component, wires scene + mannequin
│           ├── Controls/
│           │   ├── Controls.jsx                # gender toggle + height/width sliders
│           │   └── __tests__/Controls.test.jsx
│           ├── Closet/
│           │   ├── ClothingItem.jsx            # single thumbnail card
│           │   ├── Closet.jsx                  # left panel, upload + grid
│           │   └── __tests__/Closet.test.jsx
│           └── OutfitSuggester/
│               ├── OutfitSuggester.jsx         # swatches + suggestions panel
│               └── __tests__/OutfitSuggester.test.jsx
├── backend/
│   ├── main.py                                 # FastAPI app + CORS
│   ├── Procfile                                # Render entry point
│   ├── requirements.txt
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── upload.py                           # POST /upload
│   │   └── suggest.py                          # POST /suggest
│   ├── services/
│   │   ├── __init__.py
│   │   ├── bg_removal.py                       # rembg wrapper
│   │   └── color_analysis.py                   # HSL harmony logic
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py                         # sys.path fix
│       ├── test_color_analysis.py
│       ├── test_bg_removal.py
│       └── test_routes.py
└── docs/
    └── superpowers/
        ├── specs/2026-04-04-virtual-wardrobe-design.md
        └── plans/2026-04-04-virtual-wardrobe.md
```

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `frontend/` (Vite React project)
- Create: `backend/` (FastAPI project structure)
- Create: `.gitignore`

- [ ] **Step 1: Scaffold the Vite React frontend**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
npm create vite@latest frontend -- --template react
```

- [ ] **Step 2: Install frontend dependencies**

```bash
cd frontend
npm install three axios color-thief-browser
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind — replace `tailwind.config.js`**

```js
// frontend/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 4: Add Tailwind directives — replace `src/index.css`**

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Configure Vite + Vitest — replace `vite.config.js`**

```js
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
    globals: true,
  },
})
```

- [ ] **Step 6: Create test setup file**

```js
// frontend/src/test-setup.js
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Add test script to `frontend/package.json`**

Open `frontend/package.json` and add to the `"scripts"` object:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 8: Create env example**

```
# frontend/.env.example
VITE_API_URL=https://your-backend.onrender.com
```

- [ ] **Step 9: Scaffold backend directory structure**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
mkdir -p backend/routes backend/services backend/tests
touch backend/routes/__init__.py backend/services/__init__.py backend/tests/__init__.py
```

- [ ] **Step 10: Create backend `requirements.txt`**

```
# backend/requirements.txt
fastapi
uvicorn[standard]
rembg
pillow
python-multipart
pytest
httpx
```

- [ ] **Step 11: Create root `.gitignore`**

```
# .gitignore
node_modules/
dist/
.env
__pycache__/
*.pyc
venv/
.venv/
backend/venv/
.superpowers/
```

- [ ] **Step 12: Install backend dependencies**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/backend
python -m venv venv
source venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
```

- [ ] **Step 13: Commit scaffold**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add .
git commit -m "feat: scaffold monorepo — Vite React frontend + FastAPI backend"
```

---

## Task 2: FastAPI Foundation

**Files:**
- Create: `backend/main.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_routes.py` (health check only)

- [ ] **Step 1: Write the failing health check test**

```python
# backend/tests/conftest.py
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
```

```python
# backend/tests/test_routes.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/backend
source venv/Scripts/activate
pytest tests/test_routes.py::test_health -v
```

Expected: `ModuleNotFoundError: No module named 'main'`

- [ ] **Step 3: Create stub route files so imports don't crash**

```python
# backend/routes/upload.py
from fastapi import APIRouter
router = APIRouter()
```

```python
# backend/routes/suggest.py
from fastapi import APIRouter
router = APIRouter()
```

- [ ] **Step 4: Create `backend/main.py`**

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, suggest

app = FastAPI(title="Virtual Wardrobe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://cloths.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(suggest.router)

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 5: Run test — confirm it passes**

```bash
pytest tests/test_routes.py::test_health -v
```

Expected: `PASSED`

- [ ] **Step 6: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add backend/
git commit -m "feat: FastAPI foundation with CORS and health check"
```

---

## Task 3: Color Analysis Service

**Files:**
- Create: `backend/services/color_analysis.py`
- Create: `backend/tests/test_color_analysis.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_color_analysis.py
from services.color_analysis import (
    hex_to_hsl, hsl_to_hex, hue_to_color_name,
    get_harmonies, generate_suggestions
)

def test_hex_to_hsl_red():
    h, s, l = hex_to_hsl("#ff0000")
    assert round(h) == 0
    assert round(s) == 100
    assert round(l) == 50

def test_hsl_to_hex_blue():
    result = hsl_to_hex(240, 100, 50)
    assert result == "#0000ff"

def test_complementary_is_opposite_hue():
    harmonies = get_harmonies("#ff0000")   # red = hue 0
    comp_h, _, _ = hex_to_hsl(harmonies["complementary"])
    assert round(comp_h) == 180            # cyan

def test_harmonies_returns_correct_keys():
    h = get_harmonies("#3a5fa0")
    assert "complementary" in h
    assert "analogous" in h
    assert "triadic" in h
    assert len(h["analogous"]) == 2
    assert len(h["triadic"]) == 2

def test_hue_to_color_name_red():
    assert hue_to_color_name(5) == "red"
    assert hue_to_color_name(350) == "red"

def test_hue_to_color_name_blue():
    assert hue_to_color_name(220) == "blue"

def test_generate_suggestions_returns_five_swatches():
    result = generate_suggestions(["#3a5fa0"])
    assert len(result["swatches"]) == 5
    assert all(s.startswith("#") for s in result["swatches"])

def test_generate_suggestions_returns_three_text_items():
    result = generate_suggestions(["#3a5fa0"])
    assert len(result["suggestions"]) == 3

def test_generate_suggestions_empty_input():
    result = generate_suggestions([])
    assert result == {"swatches": [], "suggestions": []}
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/backend
pytest tests/test_color_analysis.py -v
```

Expected: `ImportError` — module doesn't exist yet.

- [ ] **Step 3: Implement `color_analysis.py`**

```python
# backend/services/color_analysis.py
import colorsys


def hex_to_hsl(hex_color: str) -> tuple[float, float, float]:
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s * 100, l * 100


def hsl_to_hex(h: float, s: float, l: float) -> str:
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return "#{:02x}{:02x}{:02x}".format(round(r * 255), round(g * 255), round(b * 255))


def hue_to_color_name(hue: float) -> str:
    hue = hue % 360
    if hue < 15 or hue >= 345:
        return "red"
    if hue < 45:
        return "orange"
    if hue < 75:
        return "yellow"
    if hue < 150:
        return "green"
    if hue < 195:
        return "teal"
    if hue < 255:
        return "blue"
    if hue < 285:
        return "indigo"
    if hue < 330:
        return "purple"
    return "pink"


def get_harmonies(hex_color: str) -> dict:
    h, s, l = hex_to_hsl(hex_color)
    return {
        "complementary": hsl_to_hex((h + 180) % 360, s, l),
        "analogous": [
            hsl_to_hex((h + 30) % 360, s, l),
            hsl_to_hex((h - 30) % 360, s, l),
        ],
        "triadic": [
            hsl_to_hex((h + 120) % 360, s, l),
            hsl_to_hex((h + 240) % 360, s, l),
        ],
    }


def generate_suggestions(colors: list[str]) -> dict:
    if not colors:
        return {"swatches": [], "suggestions": []}

    h, s, l = hex_to_hsl(colors[0])
    harmonies = get_harmonies(colors[0])
    primary_name = hue_to_color_name(h)
    comp_name = hue_to_color_name(hex_to_hsl(harmonies["complementary"])[0])
    ana_name = hue_to_color_name(hex_to_hsl(harmonies["analogous"][0])[0])

    return {
        "swatches": [
            harmonies["complementary"],
            *harmonies["analogous"],
            *harmonies["triadic"],
        ],
        "suggestions": [
            f"Your {primary_name} top pairs well with {comp_name} bottoms.",
            f"Try {ana_name} accessories to complement this look.",
            f"A {comp_name} jacket would complete this outfit.",
        ],
    }
```

- [ ] **Step 4: Run tests — confirm all pass**

```bash
pytest tests/test_color_analysis.py -v
```

Expected: 9 `PASSED`

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add backend/services/color_analysis.py backend/tests/test_color_analysis.py
git commit -m "feat: color analysis service — HSL harmony logic and outfit suggestions"
```

---

## Task 4: Suggest Endpoint

**Files:**
- Modify: `backend/routes/suggest.py`
- Modify: `backend/tests/test_routes.py`

- [ ] **Step 1: Add failing test for /suggest**

Append to `backend/tests/test_routes.py`:

```python
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
```

- [ ] **Step 2: Run to confirm they fail**

```bash
pytest tests/test_routes.py::test_suggest_returns_swatches_and_suggestions -v
```

Expected: `FAILED` — route returns 404 (stub has no endpoint).

- [ ] **Step 3: Implement `routes/suggest.py`**

```python
# backend/routes/suggest.py
from fastapi import APIRouter
from pydantic import BaseModel
from services.color_analysis import generate_suggestions

router = APIRouter()


class SuggestRequest(BaseModel):
    colors: list[str]


@router.post("/suggest")
def suggest_outfit(body: SuggestRequest):
    return generate_suggestions(body.colors)
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
pytest tests/test_routes.py -v
```

Expected: all `PASSED`

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add backend/routes/suggest.py backend/tests/test_routes.py
git commit -m "feat: POST /suggest endpoint with color harmony outfit suggestions"
```

---

## Task 5: Background Removal Service + Upload Endpoint

**Files:**
- Create: `backend/services/bg_removal.py`
- Create: `backend/tests/test_bg_removal.py`
- Modify: `backend/routes/upload.py`
- Modify: `backend/tests/test_routes.py`

- [ ] **Step 1: Write failing bg_removal test**

```python
# backend/tests/test_bg_removal.py
import io
from PIL import Image
from services.bg_removal import remove_background


def _make_png(width=50, height=50, color=(200, 100, 50)) -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_remove_background_returns_rgba_png():
    result = remove_background(_make_png())
    output = Image.open(io.BytesIO(result))
    assert output.mode == "RGBA"


def test_remove_background_preserves_size():
    result = remove_background(_make_png(60, 80))
    output = Image.open(io.BytesIO(result))
    assert output.size == (60, 80)
```

- [ ] **Step 2: Run to confirm they fail**

```bash
pytest tests/test_bg_removal.py -v
```

Expected: `ImportError` — module doesn't exist yet.

- [ ] **Step 3: Implement `services/bg_removal.py`**

```python
# backend/services/bg_removal.py
import io
from PIL import Image
from rembg import remove


def remove_background(image_bytes: bytes) -> bytes:
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    output_image = remove(input_image)
    buf = io.BytesIO()
    output_image.save(buf, format="PNG")
    return buf.getvalue()
```

- [ ] **Step 4: Run bg_removal tests — confirm they pass**

```bash
pytest tests/test_bg_removal.py -v
```

Expected: 2 `PASSED` (note: first run downloads the rembg model ~170 MB — this is expected).

- [ ] **Step 5: Add failing /upload test**

Append to `backend/tests/test_routes.py`:

```python
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
```

- [ ] **Step 6: Run to confirm it fails**

```bash
pytest tests/test_routes.py::test_upload_returns_png_with_valid_image -v
```

Expected: `FAILED` — stub returns no response body.

- [ ] **Step 7: Implement `routes/upload.py`**

```python
# backend/routes/upload.py
import io
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from services.bg_removal import remove_background

router = APIRouter()


@router.post("/upload")
async def upload_clothing(
    file: UploadFile = File(...),
    type: str = Form(...),
):
    image_bytes = await file.read()
    processed = remove_background(image_bytes)
    return StreamingResponse(
        io.BytesIO(processed),
        media_type="image/png",
        headers={"X-Clothing-Type": type},
    )
```

- [ ] **Step 8: Run all backend tests — confirm they all pass**

```bash
pytest -v
```

Expected: all `PASSED`

- [ ] **Step 9: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add backend/
git commit -m "feat: background removal service and POST /upload endpoint"
```

---

## Task 6: Render Deployment Config

**Files:**
- Create: `backend/Procfile`
- Create: `backend/.env.example`

- [ ] **Step 1: Create `Procfile`**

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

- [ ] **Step 2: Create `.env.example`**

```
# backend/.env.example
# No secrets required for this service.
# Update CORS origins in main.py with your Vercel deployment URL.
```

- [ ] **Step 3: Verify the server starts locally**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/backend
source venv/Scripts/activate
uvicorn main:app --reload
```

Expected: `Uvicorn running on http://127.0.0.1:8000`. Open `http://127.0.0.1:8000/health` in browser — should return `{"status":"ok"}`. Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add backend/Procfile backend/.env.example
git commit -m "feat: Render deployment config (Procfile)"
```

---

## Task 7: Frontend API Service

**Files:**
- Create: `frontend/src/services/api.js`

> Note: No unit test for `api.js` — it is a thin axios wrapper over external HTTP. It will be exercised by integration through the UI components.

- [ ] **Step 1: Create `frontend/src/services/api.js`**

```js
// frontend/src/services/api.js
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

/**
 * Upload a clothing image. Returns an object URL for the processed PNG.
 * @param {File} file
 * @param {'shirt'|'pants'} type
 * @returns {Promise<string>} blob object URL
 */
export async function uploadClothing(file, type) {
  const form = new FormData()
  form.append('file', file)
  form.append('type', type)
  const response = await api.post('/upload', form, { responseType: 'blob' })
  return URL.createObjectURL(response.data)
}

/**
 * Request outfit suggestions for the given hex color array.
 * @param {string[]} colors  e.g. ['#3a5fa0', '#f2e8d0']
 * @returns {Promise<{swatches: string[], suggestions: string[]}>}
 */
export async function getSuggestions(colors) {
  const response = await api.post('/suggest', { colors })
  return response.data
}
```

- [ ] **Step 2: Smoke test — confirm imports resolve**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm run build 2>&1 | head -20
```

Expected: build completes (or fails only on missing App.jsx content — not on api.js).

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/services/api.js
git commit -m "feat: frontend API service — uploadClothing and getSuggestions"
```

---

## Task 8: useMannequin and useWardrobe Hooks

**Files:**
- Create: `frontend/src/hooks/useMannequin.js`
- Create: `frontend/src/hooks/useWardrobe.js`
- Create: `frontend/src/hooks/__tests__/useMannequin.test.js`
- Create: `frontend/src/hooks/__tests__/useWardrobe.test.js`

- [ ] **Step 1: Write failing hook tests**

```js
// frontend/src/hooks/__tests__/useMannequin.test.js
import { renderHook, act } from '@testing-library/react'
import { useMannequin } from '../useMannequin'

test('initial gender is male', () => {
  const { result } = renderHook(() => useMannequin())
  expect(result.current.gender).toBe('male')
})

test('toggleGender switches male → female', () => {
  const { result } = renderHook(() => useMannequin())
  act(() => result.current.toggleGender())
  expect(result.current.gender).toBe('female')
})

test('toggleGender switches female → male', () => {
  const { result } = renderHook(() => useMannequin())
  act(() => result.current.toggleGender())
  act(() => result.current.toggleGender())
  expect(result.current.gender).toBe('male')
})

test('initial scaleX and scaleY are 1.0', () => {
  const { result } = renderHook(() => useMannequin())
  expect(result.current.scaleY).toBe(1.0)
  expect(result.current.scaleX).toBe(1.0)
})

test('setScaleY updates scaleY', () => {
  const { result } = renderHook(() => useMannequin())
  act(() => result.current.setScaleY(1.1))
  expect(result.current.scaleY).toBe(1.1)
})
```

```js
// frontend/src/hooks/__tests__/useWardrobe.test.js
import { renderHook, act } from '@testing-library/react'
import { useWardrobe } from '../useWardrobe'

const shirt = { id: '1', type: 'shirt', url: 'blob:1', name: 'shirt.png', colors: [] }
const pants = { id: '2', type: 'pants', url: 'blob:2', name: 'pants.png', colors: [] }

test('initial items array is empty', () => {
  const { result } = renderHook(() => useWardrobe())
  expect(result.current.items).toHaveLength(0)
})

test('addItem adds an item', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  expect(result.current.items).toHaveLength(1)
})

test('addItem replaces item of same type', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  act(() => result.current.addItem({ ...shirt, id: '3', url: 'blob:3' }))
  expect(result.current.items).toHaveLength(1)
  expect(result.current.items[0].id).toBe('3')
})

test('addItem keeps items of different types', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  act(() => result.current.addItem(pants))
  expect(result.current.items).toHaveLength(2)
})

test('removeItem removes by id', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  act(() => result.current.removeItem('1'))
  expect(result.current.items).toHaveLength(0)
})

test('getItemByType returns matching item', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  expect(result.current.getItemByType('shirt')).toEqual(shirt)
})

test('getItemByType returns null when not found', () => {
  const { result } = renderHook(() => useWardrobe())
  expect(result.current.getItemByType('shirt')).toBeNull()
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: import errors — modules don't exist yet.

- [ ] **Step 3: Implement `useMannequin.js`**

```js
// frontend/src/hooks/useMannequin.js
import { useState } from 'react'

export function useMannequin() {
  const [gender, setGender] = useState('male')
  const [scaleY, setScaleY] = useState(1.0)
  const [scaleX, setScaleX] = useState(1.0)

  function toggleGender() {
    setGender(prev => (prev === 'male' ? 'female' : 'male'))
  }

  return { gender, toggleGender, scaleY, setScaleY, scaleX, setScaleX }
}
```

- [ ] **Step 4: Implement `useWardrobe.js`**

```js
// frontend/src/hooks/useWardrobe.js
import { useState } from 'react'

export function useWardrobe() {
  const [items, setItems] = useState([])

  function addItem(item) {
    // Only one item per type — replace if same type already exists
    setItems(prev => [...prev.filter(i => i.type !== item.type), item])
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function getItemByType(type) {
    return items.find(i => i.type === type) ?? null
  }

  return { items, addItem, removeItem, getItemByType }
}
```

- [ ] **Step 5: Run tests — confirm all pass**

```bash
npm test
```

Expected: 12 `PASSED`

- [ ] **Step 6: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/hooks/
git commit -m "feat: useMannequin and useWardrobe hooks with tests"
```

---

## Task 9: Three.js Scene Setup

**Files:**
- Create: `frontend/src/components/Viewer3D/scene.js`

> Three.js renderer code runs only in a real browser DOM — vitest/jsdom cannot execute WebGL. This module is verified by visual inspection when the app runs.

- [ ] **Step 1: Create `frontend/src/components/Viewer3D/scene.js`**

```js
// frontend/src/components/Viewer3D/scene.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Initialise a Three.js scene bound to a canvas element.
 * Returns { scene, animate, resize, dispose }.
 */
export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvas.clientWidth || 600, canvas.clientHeight || 800)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8f9fa)

  const camera = new THREE.PerspectiveCamera(
    45,
    (canvas.clientWidth || 600) / (canvas.clientHeight || 800),
    0.1,
    100
  )
  camera.position.set(0, 1.2, 3.2)

  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85)
  dirLight.position.set(2, 4, 2)
  scene.add(dirLight)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1.0, 0)
  controls.enableDamping = true
  controls.minDistance = 1.5
  controls.maxDistance = 6
  controls.update()

  let animId = null

  function animate() {
    animId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function dispose() {
    cancelAnimationFrame(animId)
    controls.dispose()
    renderer.dispose()
  }

  return { scene, animate, resize, dispose }
}
```

- [ ] **Step 2: Confirm the import resolves**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm run build 2>&1 | tail -5
```

Expected: build succeeds (no import errors on scene.js).

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Viewer3D/scene.js
git commit -m "feat: Three.js scene setup with OrbitControls and resize handling"
```

---

## Task 10: Procedural Mannequin + Texture Mapping

**Files:**
- Create: `frontend/src/components/Viewer3D/mannequin.js`
- Create: `frontend/src/components/Viewer3D/Viewer3D.jsx`

- [ ] **Step 1: Create `mannequin.js`**

```js
// frontend/src/components/Viewer3D/mannequin.js
import * as THREE from 'three'

const SKIN = 0xf5deb3

function part(geometry, name) {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: SKIN })
  )
  mesh.name = name
  return mesh
}

/**
 * Build a procedural low-poly mannequin group.
 * Female silhouette is 8% narrower at shoulders.
 */
export function createMannequin(gender) {
  const w = gender === 'female' ? 0.92 : 1.0
  const g = new THREE.Group()
  g.name = 'mannequin'

  const head = part(new THREE.SphereGeometry(0.115, 16, 16), 'head')
  head.position.set(0, 1.73, 0)

  const torso = part(new THREE.BoxGeometry(0.38 * w, 0.55, 0.2), 'torso')
  torso.position.set(0, 1.26, 0)

  const lArm = part(new THREE.CylinderGeometry(0.055, 0.045, 0.52, 8), 'left_arm')
  lArm.position.set(-0.25 * w, 1.22, 0)

  const rArm = part(new THREE.CylinderGeometry(0.055, 0.045, 0.52, 8), 'right_arm')
  rArm.position.set(0.25 * w, 1.22, 0)

  const lLeg = part(new THREE.CylinderGeometry(0.075, 0.06, 0.72, 8), 'left_leg')
  lLeg.position.set(-0.11, 0.62, 0)

  const rLeg = part(new THREE.CylinderGeometry(0.075, 0.06, 0.72, 8), 'right_leg')
  rLeg.position.set(0.11, 0.62, 0)

  g.add(head, torso, lArm, rArm, lLeg, rLeg)
  return g
}

const SHIRT_SEGMENTS = ['torso', 'left_arm', 'right_arm']
const PANTS_SEGMENTS = ['left_leg', 'right_leg']

/**
 * Apply a background-removed PNG (given as an object URL) to shirt or pants segments.
 * @param {THREE.Group} mannequin
 * @param {'shirt'|'pants'} clothingType
 * @param {string} imageUrl  blob: or http: URL of transparent PNG
 */
export function applyTexture(mannequin, clothingType, imageUrl) {
  const targets = clothingType === 'shirt' ? SHIRT_SEGMENTS : PANTS_SEGMENTS
  const loader = new THREE.TextureLoader()
  loader.load(imageUrl, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    mannequin.traverse((child) => {
      if (child.isMesh && targets.includes(child.name)) {
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
        })
      }
    })
  })
}

/**
 * Scale the mannequin group.
 * @param {THREE.Group} mannequin
 * @param {number} scaleX  width (also applied to Z)
 * @param {number} scaleY  height
 */
export function setScale(mannequin, scaleX, scaleY) {
  mannequin.scale.set(scaleX, scaleY, scaleX)
}
```

- [ ] **Step 2: Create `Viewer3D.jsx`**

```jsx
// frontend/src/components/Viewer3D/Viewer3D.jsx
import { useEffect, useRef } from 'react'
import { createScene } from './scene'
import { createMannequin, applyTexture, setScale } from './mannequin'

export function Viewer3D({ gender, scaleX, scaleY, shirtUrl, pantsUrl }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)     // { scene, dispose, resize }
  const mannequinRef = useRef(null)

  // Mount scene once
  useEffect(() => {
    const canvas = canvasRef.current
    const { scene, animate, resize, dispose } = createScene(canvas)
    sceneRef.current = { scene, dispose, resize }

    const mannequin = createMannequin(gender)
    mannequinRef.current = mannequin
    scene.add(mannequin)
    animate()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    return () => {
      ro.disconnect()
      dispose()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Swap mannequin when gender changes
  useEffect(() => {
    if (!sceneRef.current) return
    const { scene } = sceneRef.current
    scene.remove(mannequinRef.current)

    const next = createMannequin(gender)
    mannequinRef.current = next
    scene.add(next)

    if (shirtUrl) applyTexture(next, 'shirt', shirtUrl)
    if (pantsUrl) applyTexture(next, 'pants', pantsUrl)
  }, [gender]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scale
  useEffect(() => {
    if (mannequinRef.current) setScale(mannequinRef.current, scaleX, scaleY)
  }, [scaleX, scaleY])

  // Shirt texture
  useEffect(() => {
    if (mannequinRef.current && shirtUrl) applyTexture(mannequinRef.current, 'shirt', shirtUrl)
  }, [shirtUrl])

  // Pants texture
  useEffect(() => {
    if (mannequinRef.current && pantsUrl) applyTexture(mannequinRef.current, 'pants', pantsUrl)
  }, [pantsUrl])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}
```

- [ ] **Step 3: Confirm build succeeds**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm run build 2>&1 | tail -5
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Viewer3D/
git commit -m "feat: procedural mannequin with texture mapping and Viewer3D component"
```

---

## Task 11: Controls Component

**Files:**
- Create: `frontend/src/components/Controls/Controls.jsx`
- Create: `frontend/src/components/Controls/__tests__/Controls.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// frontend/src/components/Controls/__tests__/Controls.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Controls } from '../Controls'

const defaults = {
  gender: 'male',
  onToggleGender: vi.fn(),
  scaleY: 1.0,
  onScaleYChange: vi.fn(),
  scaleX: 1.0,
  onScaleXChange: vi.fn(),
}

test('renders Male and Female buttons', () => {
  render(<Controls {...defaults} />)
  expect(screen.getByText('Male')).toBeInTheDocument()
  expect(screen.getByText('Female')).toBeInTheDocument()
})

test('Male button is active when gender is male', () => {
  render(<Controls {...defaults} gender="male" />)
  expect(screen.getByText('Male')).toHaveClass('bg-gray-900')
})

test('Female button is active when gender is female', () => {
  render(<Controls {...defaults} gender="female" />)
  expect(screen.getByText('Female')).toHaveClass('bg-gray-900')
})

test('clicking Female calls onToggleGender', () => {
  const onToggle = vi.fn()
  render(<Controls {...defaults} onToggleGender={onToggle} />)
  fireEvent.click(screen.getByText('Female'))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('height slider has correct value', () => {
  render(<Controls {...defaults} scaleY={1.1} />)
  const sliders = screen.getAllByRole('slider')
  expect(sliders[0]).toHaveValue('1.1')
})

test('width slider fires onScaleXChange', () => {
  const onScaleXChange = vi.fn()
  render(<Controls {...defaults} onScaleXChange={onScaleXChange} />)
  fireEvent.change(screen.getAllByRole('slider')[1], { target: { value: '0.9' } })
  expect(onScaleXChange).toHaveBeenCalledWith(0.9)
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: import error on `Controls`.

- [ ] **Step 3: Implement `Controls.jsx`**

```jsx
// frontend/src/components/Controls/Controls.jsx
export function Controls({ gender, onToggleGender, scaleY, onScaleYChange, scaleX, onScaleXChange }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 bg-white border-t border-gray-200">
      {/* Gender toggle */}
      <div className="flex gap-2 justify-center">
        {['male', 'female'].map(g => (
          <button
            key={g}
            onClick={onToggleGender}
            className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              gender === g
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>
      {/* Sliders */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-14">Height</span>
        <input
          type="range" min={0.8} max={1.2} step={0.01}
          value={scaleY}
          onChange={e => onScaleYChange(parseFloat(e.target.value))}
          className="flex-1 accent-gray-900"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-14">Width</span>
        <input
          type="range" min={0.8} max={1.2} step={0.01}
          value={scaleX}
          onChange={e => onScaleXChange(parseFloat(e.target.value))}
          className="flex-1 accent-gray-900"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm all pass**

```bash
npm test
```

Expected: all previous tests + 6 new Controls tests `PASSED`.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Controls/
git commit -m "feat: Controls component — gender toggle and height/width sliders"
```

---

## Task 12: Closet Component

**Files:**
- Create: `frontend/src/components/Closet/ClothingItem.jsx`
- Create: `frontend/src/components/Closet/Closet.jsx`
- Create: `frontend/src/components/Closet/__tests__/Closet.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// frontend/src/components/Closet/__tests__/Closet.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ClothingItem } from '../ClothingItem'

const item = { id: '1', type: 'shirt', url: 'blob:test', name: 'shirt.png', colors: [] }

test('renders item thumbnail', () => {
  render(<ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByAltText('shirt.png')).toBeInTheDocument()
})

test('shows active border when isActive is true', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={true} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild).toHaveClass('border-gray-900')
})

test('shows inactive border when isActive is false', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild).toHaveClass('border-gray-200')
})

test('calls onSelect with item when clicked', () => {
  const onSelect = vi.fn()
  render(<ClothingItem item={item} isActive={false} onSelect={onSelect} onRemove={vi.fn()} />)
  fireEvent.click(screen.getByAltText('shirt.png'))
  expect(onSelect).toHaveBeenCalledWith(item)
})

test('calls onRemove with item id when × clicked', () => {
  const onRemove = vi.fn()
  render(<ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={onRemove} />)
  fireEvent.click(screen.getByText('×'))
  expect(onRemove).toHaveBeenCalledWith('1')
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npm test
```

Expected: import error on `ClothingItem`.

- [ ] **Step 3: Implement `ClothingItem.jsx`**

```jsx
// frontend/src/components/Closet/ClothingItem.jsx
export function ClothingItem({ item, isActive, onSelect, onRemove }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`relative cursor-pointer rounded-lg border-2 p-1 transition-colors ${
        isActive ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <img
        src={item.url}
        alt={item.name}
        className="w-full h-20 object-contain bg-gray-50 rounded"
      />
      <button
        onClick={e => { e.stopPropagation(); onRemove(item.id) }}
        className="absolute top-1 right-1 w-5 h-5 bg-red-400 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
      <p className="text-xs text-gray-500 truncate mt-1 px-0.5">{item.name}</p>
    </div>
  )
}
```

- [ ] **Step 4: Implement `Closet.jsx`**

```jsx
// frontend/src/components/Closet/Closet.jsx
import { useRef } from 'react'
import { ClothingItem } from './ClothingItem'
import { uploadClothing } from '../../services/api'
import ColorThief from 'color-thief-browser'

const colorThief = new ColorThief()

function extractColors(imageUrl) {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const palette = colorThief.getPalette(img, 2) || []
        resolve(
          palette.map(([r, g, b]) =>
            '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
          )
        )
      } catch {
        resolve(['#888888'])
      }
    }
    img.onerror = () => resolve(['#888888'])
    img.src = imageUrl
  })
}

export function Closet({ items, activeShirt, activePants, onAddItem, onRemoveItem, onSelectItem }) {
  const shirtRef = useRef(null)
  const pantsRef = useRef(null)

  async function handleUpload(file, type) {
    if (!file) return
    const url = await uploadClothing(file, type)
    const colors = await extractColors(url)
    onAddItem({ id: Date.now().toString(), type, url, name: file.name, colors })
  }

  const shirts = items.filter(i => i.type === 'shirt')
  const pants = items.filter(i => i.type === 'pants')

  function Section({ label, inputRef, type, clothingItems, activeItem }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs font-semibold text-gray-900 hover:underline"
          >
            + Add
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleUpload(e.target.files?.[0], type)}
        />
        <div className="grid grid-cols-2 gap-2">
          {clothingItems.map(item => (
            <ClothingItem
              key={item.id}
              item={item}
              isActive={activeItem?.id === item.id}
              onSelect={onSelectItem}
              onRemove={onRemoveItem}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-4 overflow-y-auto h-full bg-white border-r border-gray-200">
      <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
        Digital Closet
      </h2>
      <Section label="Shirts" inputRef={shirtRef} type="shirt" clothingItems={shirts} activeItem={activeShirt} />
      <Section label="Pants" inputRef={pantsRef} type="pants" clothingItems={pants} activeItem={activePants} />
    </div>
  )
}
```

- [ ] **Step 5: Run tests — confirm all pass**

```bash
npm test
```

Expected: all previous tests + 5 new ClothingItem tests `PASSED`.

- [ ] **Step 6: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Closet/
git commit -m "feat: Closet and ClothingItem components with upload and color extraction"
```

---

## Task 13: OutfitSuggester Component

**Files:**
- Create: `frontend/src/components/OutfitSuggester/OutfitSuggester.jsx`
- Create: `frontend/src/components/OutfitSuggester/__tests__/OutfitSuggester.test.jsx`

- [ ] **Step 1: Write failing tests**

```jsx
// frontend/src/components/OutfitSuggester/__tests__/OutfitSuggester.test.jsx
import { render, screen } from '@testing-library/react'
import { OutfitSuggester } from '../OutfitSuggester'

test('shows empty state when items array is empty', () => {
  render(<OutfitSuggester items={[]} />)
  expect(screen.getByText(/Add clothing items/)).toBeInTheDocument()
})

test('Suggest Outfit button is disabled with no items', () => {
  render(<OutfitSuggester items={[]} />)
  expect(screen.getByRole('button', { name: /Suggest Outfit/i })).toBeDisabled()
})

test('Suggest Outfit button is enabled when items exist', () => {
  const items = [{ id: '1', type: 'shirt', url: 'blob:1', name: 'shirt.png', colors: ['#3a5fa0'] }]
  render(<OutfitSuggester items={items} />)
  expect(screen.getByRole('button', { name: /Suggest Outfit/i })).not.toBeDisabled()
})

test('renders section heading', () => {
  render(<OutfitSuggester items={[]} />)
  expect(screen.getByText(/Outfit Suggester/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npm test
```

Expected: import error on `OutfitSuggester`.

- [ ] **Step 3: Implement `OutfitSuggester.jsx`**

```jsx
// frontend/src/components/OutfitSuggester/OutfitSuggester.jsx
import { useState } from 'react'
import { getSuggestions } from '../../services/api'

export function OutfitSuggester({ items }) {
  const [swatches, setSwatches] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleSuggest() {
    const colors = items.flatMap(i => i.colors)
    if (!colors.length) return
    setLoading(true)
    try {
      const result = await getSuggestions(colors)
      setSwatches(result.swatches)
      setSuggestions(result.suggestions)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-white border-l border-gray-200 overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
        Outfit Suggester
      </h2>

      <button
        onClick={handleSuggest}
        disabled={loading || items.length === 0}
        className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg
                   disabled:opacity-40 hover:bg-gray-700 transition-colors"
      >
        {loading ? 'Analysing…' : 'Suggest Outfit'}
      </button>

      {swatches.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Complementary palette</p>
          <div className="flex gap-2 flex-wrap">
            {swatches.map((hex, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <span className="text-xs text-gray-400">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">Suggestions</p>
          {suggestions.map((s, i) => (
            <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-snug">
              {s}
            </p>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-6">
          Add clothing items to get suggestions
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — confirm all pass**

```bash
npm test
```

Expected: all previous tests + 4 new `PASSED`.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/OutfitSuggester/
git commit -m "feat: OutfitSuggester component with swatch palette and suggestion text"
```

---

## Task 14: App Layout Assembly

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Replace `frontend/src/App.jsx`**

```jsx
// frontend/src/App.jsx
import { useState } from 'react'
import { useMannequin } from './hooks/useMannequin'
import { useWardrobe } from './hooks/useWardrobe'
import { Viewer3D } from './components/Viewer3D/Viewer3D'
import { Controls } from './components/Controls/Controls'
import { Closet } from './components/Closet/Closet'
import { OutfitSuggester } from './components/OutfitSuggester/OutfitSuggester'

export default function App() {
  const { gender, toggleGender, scaleX, setScaleX, scaleY, setScaleY } = useMannequin()
  const { items, addItem, removeItem } = useWardrobe()
  const [activeShirt, setActiveShirt] = useState(null)
  const [activePants, setActivePants] = useState(null)

  function handleSelectItem(item) {
    if (item.type === 'shirt') setActiveShirt(item)
    if (item.type === 'pants') setActivePants(item)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-6 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <h1 className="text-base font-bold text-gray-900 tracking-tight">Virtual Wardrobe</h1>
      </header>

      {/* Three-column body */}
      <div className="flex flex-1 min-h-0">
        {/* Left — Digital Closet */}
        <div className="w-52 flex-shrink-0 overflow-hidden">
          <Closet
            items={items}
            activeShirt={activeShirt}
            activePants={activePants}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onSelectItem={handleSelectItem}
          />
        </div>

        {/* Center — Mannequin */}
        <div className="flex flex-col flex-1 min-w-0 border-x border-gray-200">
          <div className="flex-1 relative bg-gray-50">
            <Viewer3D
              gender={gender}
              scaleX={scaleX}
              scaleY={scaleY}
              shirtUrl={activeShirt?.url ?? null}
              pantsUrl={activePants?.url ?? null}
            />
          </div>
          <Controls
            gender={gender}
            onToggleGender={toggleGender}
            scaleY={scaleY}
            onScaleYChange={setScaleY}
            scaleX={scaleX}
            onScaleXChange={setScaleX}
          />
        </div>

        {/* Right — Outfit Suggester */}
        <div className="w-52 flex-shrink-0 overflow-hidden">
          <OutfitSuggester items={items} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Ensure `main.jsx` imports `index.css`**

Open `frontend/src/main.jsx` and confirm it contains:
```js
import './index.css'
```

If not, add it as the first import.

- [ ] **Step 3: Start the dev server and verify the UI renders**

```bash
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm run dev
```

Open `http://localhost:5173`. You should see:
- Header with "Virtual Wardrobe"
- Three columns: Digital Closet | 3D mannequin canvas | Outfit Suggester
- Male/Female toggle and sliders visible below the mannequin
- Mannequin rotates with mouse drag

Stop with Ctrl+C.

- [ ] **Step 4: Run all frontend tests**

```bash
npm test
```

Expected: all tests `PASSED`.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/App.jsx frontend/src/main.jsx
git commit -m "feat: assemble three-column App layout — mannequin centered"
```

---

## Task 15: Vercel Deployment Config

**Files:**
- Create: `frontend/vercel.json`
- Create: `frontend/.env.local` (not committed — user creates from example)

- [ ] **Step 1: Create `frontend/vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

- [ ] **Step 2: Deploy backend to Render**

1. Push repo to GitHub
2. Go to https://render.com → New Web Service → connect your repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Copy the Render URL (e.g. `https://virtual-wardrobe-api.onrender.com`)

- [ ] **Step 3: Deploy frontend to Vercel**

1. Go to https://vercel.com → New Project → import repo
2. Set **Root Directory** to `frontend`
3. Add **Environment Variable**: `VITE_API_URL` = your Render URL from Step 2
4. Deploy

- [ ] **Step 4: Update CORS in `backend/main.py` with actual Vercel URL**

```python
# Replace the placeholder in allow_origins:
allow_origins=[
    "http://localhost:5173",
    "https://YOUR-PROJECT.vercel.app",   # ← actual Vercel URL
],
```

- [ ] **Step 5: Redeploy backend, smoke test the live URL**

Open your Vercel URL in a browser. Confirm:
- Mannequin renders in center column
- Upload a shirt image — background is stripped, texture appears on mannequin torso
- Click "Suggest Outfit" — swatches and text suggestions appear

- [ ] **Step 6: Final commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/vercel.json backend/main.py
git commit -m "feat: Vercel + Render deployment config, update CORS for production"
```

---

## Done

All 15 tasks produce a working, deployable Virtual Wardrobe application. The showcase URL is your Vercel deployment.
