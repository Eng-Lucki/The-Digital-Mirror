# Virtual Wardrobe — Design Spec
**Date:** 2026-04-04
**Purpose:** University innovation competition showcase/demo

---

## Overview

A web-based 3D Virtual Wardrobe application. Users upload clothing images, which are background-stripped and mapped as textures onto a 3D mannequin. An AI Outfit Suggester analyzes clothing colors and recommends matching combinations. Built as a competition POC — no auth, no database.

---

## Architecture

**Approach:** Monorepo, two separate services.

- **Frontend:** React + Three.js → deployed to Vercel
- **Backend:** FastAPI (Python) → deployed to Render (free tier)
- Communication: HTTPS REST API, CORS configured for Vercel origin

```
cloths/
├── frontend/
│   ├── public/
│   │   └── models/               # mannequin-male.glb, mannequin-female.glb
│   ├── src/
│   │   ├── components/
│   │   │   ├── Viewer3D/         # Three.js scene + mannequin renderer
│   │   │   ├── Closet/           # Digital Closet left panel
│   │   │   ├── Controls/         # Gender toggle + height/width sliders
│   │   │   └── OutfitSuggester/  # Color swatches + text suggestions
│   │   ├── hooks/
│   │   │   ├── useMannequin.js   # mannequin state (gender, scale)
│   │   │   └── useWardrobe.js    # clothing items state
│   │   ├── services/
│   │   │   └── api.js            # axios calls to FastAPI
│   │   └── App.jsx
│   └── package.json
│
└── backend/
    ├── main.py                   # FastAPI app + CORS
    ├── routes/
    │   ├── upload.py             # POST /upload
    │   └── suggest.py            # POST /suggest
    ├── services/
    │   ├── bg_removal.py         # rembg wrapper
    │   └── color_analysis.py     # HSL color harmony logic
    ├── requirements.txt
    └── Procfile                  # for Render deployment
```

---

## 3D Mannequin System

**Model:** Free CC0 low-poly humanoid `.glb` (sourced from Mixamo/Sketchfab) with separately named mesh segments: `torso`, `left_arm`, `right_arm`, `left_leg`, `right_leg`, `head`. Each segment has its own `MeshStandardMaterial` for independent texture swapping.

**Three.js scene:**
- `OrbitControls` for rotate/zoom interaction
- `AmbientLight` + `DirectionalLight` for neutral lighting
- `WebGLRenderer` with `antialias: true`
- Canvas fills right panel, responsive to window resize

**Gender toggle:** Two separate `.glb` files. Toggling swaps the loaded model and re-applies active clothing textures.

**Height/Width sliders:**
- Height → `mannequin.scale.y` (range: 0.8–1.2)
- Width → `mannequin.scale.x` and `mannequin.scale.z` (range: 0.8–1.2)
- No mesh morphing — scale transform only

**Texture mapping:**
- Shirt upload → texture applied to `torso` mesh segment
- Pants upload → texture applied to `left_leg` + `right_leg` mesh segments
- `THREE.TextureLoader` loads processed PNG from object URL
- Texture color space: `THREE.SRGBColorSpace`

---

## Backend & Image Processing

### `POST /upload`
- **Input:** `multipart/form-data` — `file` (image) + `type` (`shirt` | `pants`)
- **Processing:** `rembg.remove()` on raw image bytes — strips background, outputs RGBA PNG
- **Output:** `StreamingResponse` with `Content-Type: image/png`
- **Storage:** Fully in-memory pipeline — no disk writes (free-tier Render compatible)

### `POST /suggest`
- **Input:** `{ "colors": ["#3A5FA0", "#F2E8D0"] }` — hex codes extracted client-side from dominant pixels
- **Processing:**
  1. Convert hex → HSL
  2. Compute color harmonies: complementary (hue +180°), analogous (±30°), triadic (±120°)
  3. Map HSL ranges to garment names via lookup table (e.g. hue 200–240° = "navy")
  4. Generate suggestion strings from templates
- **Output:** `{ "swatches": ["#hex", ...], "suggestions": ["Try pairing with...", ...] }`

**Dependencies (`requirements.txt`):**
```
fastapi
uvicorn[standard]
rembg
pillow
python-multipart
```

---

## UI/UX Dashboard

**Two-panel layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Virtual Wardrobe                       [Male] [Female]  │
├──────────────────────┬──────────────────────────────────┤
│  DIGITAL CLOSET      │                                  │
│  [+ Add Shirt]       │        3D MANNEQUIN              │
│  [+ Add Pants]       │         (Three.js canvas)        │
│                      │      [rotate / zoom]             │
│  Shirts: thumbnails  ├──────────────────────────────────┤
│  Pants: thumbnails   │  Height slider    Width slider   │
│                      ├──────────────────────────────────┤
│                      │  OUTFIT SUGGESTER                │
│                      │  ● ● ● ●  Complementary palette  │
│                      │  "Try pairing with navy trousers"│
└──────────────────────┴──────────────────────────────────┘
```

**Design language:**
- Tailwind CSS — white/light-gray background, dark text
- Clothing thumbnails show processed transparent PNG
- Clicking a closet item applies it to the mannequin immediately
- Active item highlighted with colored border
- Outfit Suggester panel always visible below controls

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploy from `frontend/` on push |
| Backend | Render | Free tier, `Procfile` with `uvicorn main:app` |

- CORS: FastAPI allows Vercel production URL + `localhost:5173` (dev)
- Environment variable `VITE_API_URL` in Vercel points to Render backend URL

---

## Out of Scope (for this showcase)

- User authentication / accounts
- Persistent database storage
- Mobile responsiveness
- Shoe / accessory clothing types (shirt + pants only)
- Real-time collaboration
