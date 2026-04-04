# The Digital Mirror

A web-based 3D Virtual Wardrobe application built for a university innovation competition. Upload clothing photos, strip backgrounds automatically, and see them mapped as textures onto a 3D mannequin — then get AI-powered color-harmony outfit suggestions.

---

## Features

- **3D Mannequin** — Procedural low-poly mannequin with male/female silhouettes, height and width sliders, and free-rotation orbit controls
- **Smart Upload** — Clothing images are sent to the backend where `rembg` removes the background, returning a clean transparent PNG mapped directly onto the mannequin
- **Digital Closet** — Left panel displays uploaded shirts and pants as thumbnail cards; click to activate on the mannequin, click × to remove
- **Outfit Suggester** — Color-harmony engine (complementary, analogous, triadic) extracts dominant colors from your clothing and returns palette swatches + styled outfit suggestions
- **Three-Column Layout** — Closet | Mannequin (center) | Outfit Suggester

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Three.js, Tailwind CSS v4 |
| 3D | Procedural geometry, OrbitControls, texture mapping |
| Color | color-thief-browser (client), colorsys HSL (server) |
| Backend | FastAPI, rembg, Pillow, Python 3 |
| Testing | Vitest + @testing-library/react, pytest |
| Deploy | Vercel (frontend), Render (backend) |

---

## Project Structure

```
The-Digital-Mirror/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── App.jsx         # Three-column layout root
│   │   ├── components/
│   │   │   ├── Viewer3D/   # Three.js canvas, mannequin, scene
│   │   │   ├── Controls/   # Gender toggle + sliders
│   │   │   ├── Closet/     # Upload panel + clothing grid
│   │   │   └── OutfitSuggester/  # Palette + suggestions
│   │   ├── hooks/
│   │   │   ├── useMannequin.js   # gender, scaleX, scaleY state
│   │   │   └── useWardrobe.js    # clothing items state
│   │   └── services/
│   │       └── api.js      # uploadClothing(), getSuggestions()
│   └── vercel.json
└── backend/                # FastAPI app
    ├── main.py             # App entry point + CORS
    ├── routes/
    │   ├── upload.py       # POST /upload — bg removal
    │   └── suggest.py      # POST /suggest — color harmony
    └── services/
        ├── bg_removal.py   # rembg wrapper
        └── color_analysis.py  # HSL harmony logic
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
```

### Environment

Create `frontend/.env.local`:

```
VITE_API_URL=http://localhost:8000
```

---

## Running Tests

```bash
# Frontend (27 tests)
cd frontend && npm test

# Backend (15 tests)
cd backend && pytest tests/ -v
```

---

## Deployment

### Backend → Render

1. New Web Service → connect this repo
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel

1. New Project → import this repo
2. Root Directory: `frontend`
3. Add environment variable: `VITE_API_URL` = your Render URL
4. Deploy

After deploying, update `allow_origin_regex` in `backend/main.py` with your specific Vercel project URL.

---

## API Reference

### `POST /upload`

Upload a clothing image for background removal.

| Field | Type | Description |
|---|---|---|
| `file` | `File` | Image file (JPEG, PNG, WebP) |
| `type` | `string` | `"shirt"` or `"pants"` |

**Response:** Transparent PNG (`image/png`) with header `X-Clothing-Type`.

### `POST /suggest`

Get outfit suggestions based on clothing colors.

```json
{ "colors": ["#3a5fa0", "#c0392b"] }
```

**Response:**

```json
{
  "swatches": ["#3a5fa0", "#a05a3a", "#5aa03a", "#3aa05a", "#5a3aa0"],
  "suggestions": [
    "Pair your navy blue with warm terracotta for a bold contrast.",
    "Try an analogous palette — dusty teal and slate complement this base.",
    "A triadic combo with mustard and rose adds vibrancy to the outfit."
  ]
}
```

---

## License

MIT
