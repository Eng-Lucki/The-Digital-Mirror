# UI Redesign & Mannequin Upgrade — Design Spec

**Date:** 2026-04-05
**Project:** The Digital Mirror — Virtual Wardrobe
**Scope:** Full UI redesign (glassmorphism + purple theme + starfield) and mannequin rebuild (lathe geometry + smooth material + 6 clothing types)

---

## 1. Visual Design System

### Background
Full-viewport deep purple gradient: `#0f0a1e` → `#1a0f35` → `#0d1b3e` (dark purple to midnight blue), applied as a CSS `linear-gradient` on the root `<div>`. An animated starfield layer sits above it (see Section 2).

### Starfield
800 small white points (`THREE.Points` with `BufferGeometry`) placed at random positions in the scene background — rendered in the Three.js canvas. Alternatively implemented as a CSS/canvas overlay with `position: fixed; z-index: 0`. Points vary in opacity (0.3–1.0) and slowly twinkle via a sine-wave animation on opacity. No movement — pure twinkle effect.

### Glass Panels
All three columns and the header are frosted glass cards:
- `backdrop-filter: blur(16px)`
- `background: rgba(255, 255, 255, 0.05)`
- `border: 1px solid rgba(255, 255, 255, 0.12)`
- `box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.3)`

### Accent Color
- Primary: `#a855f7` (purple-500)
- Hover: `#c084fc` (purple-400)
- Disabled: 30% opacity
- Glow: `box-shadow: 0 0 20px rgba(168, 85, 247, 0.5)`

### Typography
- Font: **Inter** (loaded via Google Fonts in `index.html`)
- Section labels: `text-xs tracking-[0.2em] uppercase text-purple-300`
- Body: `text-white/80`
- Header logo: `bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`

### Custom Scrollbar
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 2px; }
```

---

## 2. Layout & Panels

### Header
Full-width frosted glass bar (`h-14`). Left: "The Digital Mirror" gradient logo text. Subtle shimmer border at the bottom (`border-b border-white/10`).

### Three-Column Body
Same flex layout. All three columns are glass cards floating over the gradient background.

| Column | Width | Content |
|---|---|---|
| Left — Digital Closet | 240px | 6 collapsible clothing sections |
| Center — Mannequin | flex-1 | Three.js canvas + controls bar |
| Right — Outfit Suggester | 240px | Suggest button + swatches + cards |

### Left Panel — Digital Closet
- 6 collapsible sections: Shirts, Pants, Hats, Sunglasses, Scarves, Shoes
- Each section has a purple chevron toggle (▼/▶) and collapses/expands smoothly
- Upload trigger: dashed-border card with centered `+` icon and type label
- Active item: purple glow border (`ring-2 ring-purple-500 ring-offset-1`)
- Inactive items: `border border-white/10`

### Center Panel — Mannequin
- Canvas background: `rgba(0, 0, 0, 0.3)` (darker cutout so mannequin pops)
- Subtle radial gradient "floor light" beneath mannequin feet: `radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.15), transparent 60%)`
- Camera hint: "Drag to rotate · Scroll to zoom" shown as faded text, hidden after first `pointerdown` event

### Controls Bar (bottom of center)
Frosted glass strip (`h-16`). Two sections side by side:
- **Gender toggle:** Pill-shaped segmented control; active side slides with a purple filled pill (`transition-transform`)
- **Sliders:** Height and Width, purple `accent-color`, label on left

### Right Panel — Outfit Suggester
- **Suggest Outfit button:** Full-width gradient (`from-purple-600 to-pink-500`), shimmer sweep on hover (CSS `@keyframes shimmer`)
- **Swatches:** 40px circles, floating hex tooltip on hover (`title` attribute suffices)
- **Suggestion cards:** White text on `rgba(255,255,255,0.05)` glass card, `border-l-2 border-purple-500` accent stripe on left
- **Error state:** `text-red-400` small text below button
- **Empty state:** Centered muted text

---

## 3. Mannequin Rebuild

### Geometry — Lathe Segments
All body parts use `THREE.LatheGeometry` (profile points spun 360° around Y) except where noted. 32 radial segments for smoothness.

| Segment name | Geometry | Position (Y center) |
|---|---|---|
| `head` | `SphereGeometry(0.12, 32, 32)` | y = 1.75 |
| `neck` | Lathe: narrow taper 0.04→0.05, h=0.12 | y = 1.58 |
| `torso` | Lathe: chest(0.22)→waist(0.16)→hip(0.20), h=0.58 | y = 1.22 |
| `left_shoulder` | Lathe: rounded cap r=0.07 | y = 1.48, x = ±0.28 |
| `right_shoulder` | same | y = 1.48, x = ±0.28 |
| `left_upper_arm` | Lathe: 0.065→0.055, h=0.26 | y = 1.22, x = ±0.32 |
| `right_upper_arm` | same | same |
| `left_lower_arm` | Lathe: 0.055→0.04, h=0.24 | y = 0.94, x = ±0.32 |
| `right_lower_arm` | same | same |
| `left_upper_leg` | Lathe: 0.09→0.075, h=0.34 | y = 0.72, x = ±0.10 |
| `right_upper_leg` | same | same |
| `left_lower_leg` | Lathe: 0.075→0.055, h=0.34 | y = 0.34, x = ±0.10 |
| `right_lower_leg` | same | same |
| `left_foot` | `BoxGeometry(0.10, 0.06, 0.18)` | y = 0.03, x = ±0.10 |
| `right_foot` | same | same |

Female silhouette: torso lathe points adjusted — narrower shoulders (×0.88), wider hips (×1.08).

### Material
`THREE.MeshPhysicalMaterial`:
```js
{
  color: 0xe8d5c4,       // warm mannequin beige
  roughness: 0.15,
  metalness: 0.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
}
```

### Lighting Upgrade (`scene.js`)
- Keep existing `AmbientLight` (intensity 0.6)
- Keep existing `DirectionalLight` (intensity 1.0, position top-right)
- Add `RectAreaLight` (white, intensity 2, 2×4 size) positioned front-center for soft fill
- Add `PointLight` (`#a855f7`, intensity 0.8, distance 5) positioned below mannequin for purple glow

### Starfield (scene.js)
```js
// 800 random points in a sphere of radius 8
const positions = new Float32Array(800 * 3)
// random x,y,z in [-8, 8]
const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.8 })
const stars = new THREE.Points(geometry, material)
scene.add(stars)
```
Stars slowly twinkle: in the `animate` loop, `material.opacity = 0.5 + 0.3 * Math.sin(Date.now() * 0.001)`.

---

## 4. Clothing Categories & Segment Mapping

| Type | Key | Mannequin segments |
|---|---|---|
| Shirt | `shirt` | `torso`, `left_shoulder`, `right_shoulder`, `left_upper_arm`, `right_upper_arm` |
| Pants | `pants` | `left_upper_leg`, `right_upper_leg`, `left_lower_leg`, `right_lower_leg` |
| Hat | `hat` | `head` |
| Sunglasses | `sunglasses` | `head` |
| Scarf | `scarf` | `neck` |
| Shoes | `shoes` | `left_foot`, `right_foot` |

> Note: hat and sunglasses both target `head`. The last applied wins — this is acceptable for a showcase demo where only one headwear item is worn at a time.

---

## 5. Component Changes

### `frontend/src/index.html`
- Add Inter font `<link rel="preconnect">` + `<link rel="stylesheet">` for Google Fonts

### `frontend/src/index.css`
- Replace Tailwind directives section with custom scrollbar CSS, glassmorphism utility classes, and shimmer keyframe animation
- Keep `@tailwind base/components/utilities`

### `frontend/src/components/Viewer3D/mannequin.js`
- Full rewrite: lathe geometry for all segments, `MeshPhysicalMaterial`, female silhouette variant, updated `SHIRT_SEGMENTS` / `PANTS_SEGMENTS` / new `HAT_SEGMENTS` / `SCARF_SEGMENTS` / `SHOES_SEGMENTS` / `SUNGLASSES_SEGMENTS` maps

### `frontend/src/components/Viewer3D/scene.js`
- Add `RectAreaLight`, purple `PointLight`, starfield `THREE.Points`

### `frontend/src/components/Viewer3D/Viewer3D.jsx`
- Add 4 new `useEffect` hooks for hat, sunglasses, scarf, shoes texture application
- Props: add `hatUrl`, `sunglassesUrl`, `scarfUrl`, `shoesUrl`

### `frontend/src/components/Controls/Controls.jsx`
- Gender toggle → sliding pill segmented control
- Sliders → purple styled with value display

### `frontend/src/components/Closet/Closet.jsx`
- 6 sections (Shirts, Pants, Hats, Sunglasses, Scarves, Shoes)
- Each section collapsible with chevron toggle (local `useState` per section)
- Upload drop-zone card style

### `frontend/src/components/OutfitSuggester/OutfitSuggester.jsx`
- Gradient suggest button with shimmer hover
- Larger swatches (40px), tooltip on hover
- Suggestion cards with purple left border

### `frontend/src/App.jsx`
- Add `activeHat`, `activeSunglasses`, `activeScarf`, `activeShoes` state (all null)
- `handleSelectItem` extended for 4 new types
- `handleRemoveItem` extended for 4 new types
- Pass new URL props to `Viewer3D`

### `frontend/src/App.css`
- Remove or repurpose (was Vite boilerplate); add any global animation keyframes not in index.css

---

## 6. Testing

- Update `Closet.test.jsx`: test all 6 section headings render
- Update `Controls.test.jsx`: test gender toggle still works with new pill structure
- Keep all existing 27 tests passing
- Add tests for new clothing types in `useWardrobe.test.js` (hat, sunglasses, scarf, shoes via `addItem`)

---

## 7. Out of Scope

- No backend changes
- No new API endpoints
- No animation of the mannequin (idle pose, breathing) — static only
- No drag-and-drop file upload (click-to-upload only)
- No persistence (in-memory only, as before)
