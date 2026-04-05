# UI Redesign & Mannequin Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the primitive gray UI with a dark glassmorphism design (deep purple gradient, frosted glass panels, starfield) and rebuild the Three.js mannequin with smooth lathe geometry, a physical material, and 6 clothing types (shirt, pants, hat, sunglasses, scarf, shoes).

**Architecture:** Frontend-only changes. No backend modifications. All tasks are isolated to `frontend/src/`. Tasks must be executed in order since later tasks (App, Closet) depend on interfaces defined in earlier ones (mannequin SEGMENT_MAP, Viewer3D props).

**Tech Stack:** React 18, Three.js (LatheGeometry, MeshPhysicalMaterial, RectAreaLight, Points), Tailwind CSS v4, Vitest + @testing-library/react

---

## File Map

```
frontend/
├── index.html                                  # Task 1 — add Inter font links
├── tailwind.config.js                          # Task 1 — add shimmer animation
├── src/
│   ├── index.css                               # Task 1 — scrollbar + .glass + shimmer keyframe
│   ├── App.jsx                                 # Task 9 — 6 active states, gradient bg, glass layout
│   ├── components/
│   │   ├── Viewer3D/
│   │   │   ├── mannequin.js                    # Task 2 — lathe geometry, MeshPhysicalMaterial, SEGMENT_MAP
│   │   │   ├── scene.js                        # Task 3 — RectAreaLight, purple PointLight, starfield
│   │   │   └── Viewer3D.jsx                    # Task 4 — 4 new clothing useEffects, new props
│   │   ├── Controls/
│   │   │   ├── Controls.jsx                    # Task 5 — sliding pill toggle, purple sliders
│   │   │   └── __tests__/Controls.test.jsx     # Task 5 — update class assertions
│   │   ├── Closet/
│   │   │   ├── ClothingItem.jsx                # Task 6 — purple glow active, glass card
│   │   │   ├── Closet.jsx                      # Task 7 — 6 collapsible sections, activeMap prop
│   │   │   └── __tests__/Closet.test.jsx       # Task 6+7 — update assertions, add section tests
│   │   └── OutfitSuggester/
│   │       ├── OutfitSuggester.jsx             # Task 8 — gradient button, shimmer, accent cards
│   │       └── __tests__/OutfitSuggester.test.jsx  # Task 8 — stays passing
```

---

## Task 1: Global Styles, Font & Tailwind

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`

No tests — pure styling.

- [ ] **Step 1: Add Inter font to `frontend/index.html`**

Replace the entire file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Digital Mirror</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Add shimmer animation to `frontend/tailwind.config.js`**

Replace the entire file:

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Replace `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    font-family: 'Inter', sans-serif;
  }

  ::-webkit-scrollbar {
    width: 4px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #a855f7;
    border-radius: 2px;
  }
}

@layer utilities {
  .glass {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/index.html frontend/tailwind.config.js frontend/src/index.css
git commit -m "feat: add Inter font, glass utility, shimmer animation to global styles"
```

---

## Task 2: Mannequin Rebuild (Lathe Geometry + Physical Material)

**Files:**
- Modify: `frontend/src/components/Viewer3D/mannequin.js`

No unit tests — Three.js geometry is verified by visual inspection. The mannequin is exercised by the existing Viewer3D integration path.

- [ ] **Step 1: Replace `frontend/src/components/Viewer3D/mannequin.js` entirely**

```js
// frontend/src/components/Viewer3D/mannequin.js
import * as THREE from 'three'

function makeMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe8d5c4,
    roughness: 0.15,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  })
}

function part(geometry, name) {
  const mesh = new THREE.Mesh(geometry, makeMaterial())
  mesh.name = name
  return mesh
}

/**
 * Build a lathe-geometry body segment that tapers from rBottom to rTop over the given height.
 * The geometry spans y=0 to y=height; position the mesh so its bottom is at the desired world Y.
 */
function makeTaper(rBottom, rTop, height, name) {
  const points = [
    new THREE.Vector2(rBottom, 0),
    new THREE.Vector2((rBottom + rTop) / 2, height / 2),
    new THREE.Vector2(rTop, height),
  ]
  return part(new THREE.LatheGeometry(points, 32), name)
}

/**
 * Create a procedural mannequin group with smooth lathe geometry.
 * @param {'male'|'female'} gender
 * @returns {THREE.Group}
 */
export function createMannequin(gender) {
  const isFemale = gender === 'female'
  const sw = isFemale ? 0.88 : 1.0   // shoulder width scale
  const hw = isFemale ? 1.08 : 1.0   // hip width scale

  const g = new THREE.Group()
  g.name = 'mannequin'

  // ── Head ──────────────────────────────────────────────────────────
  const head = part(new THREE.SphereGeometry(0.12, 32, 32), 'head')
  head.position.set(0, 1.75, 0)

  // ── Neck ──────────────────────────────────────────────────────────
  const neck = makeTaper(0.045, 0.05, 0.12, 'neck')
  neck.position.set(0, 1.52, 0)           // bottom at 1.52, top at 1.64 → blends into head

  // ── Torso (chest → waist → hip curve) ────────────────────────────
  const torsoPoints = [
    new THREE.Vector2(0.20 * hw, 0),       // hip
    new THREE.Vector2(0.155, 0.18),        // waist
    new THREE.Vector2(0.19, 0.38),         // lower chest
    new THREE.Vector2(0.22 * sw, 0.58),    // upper chest
  ]
  const torso = part(new THREE.LatheGeometry(torsoPoints, 32), 'torso')
  torso.position.set(0, 0.93, 0)           // bottom at 0.93, top at 1.51

  // ── Shoulders (rounded dome caps) ────────────────────────────────
  const shoulderPoints = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.065, 0.04),
    new THREE.Vector2(0.07, 0.09),
    new THREE.Vector2(0.01, 0.14),
  ]
  const shoulderGeoBase = new THREE.LatheGeometry(shoulderPoints, 32)

  const lShoulder = part(shoulderGeoBase.clone(), 'left_shoulder')
  lShoulder.position.set(-0.28 * sw, 1.41, 0)
  const rShoulder = part(shoulderGeoBase.clone(), 'right_shoulder')
  rShoulder.position.set(0.28 * sw, 1.41, 0)

  // ── Upper Arms ────────────────────────────────────────────────────
  const lUpperArm = makeTaper(0.065, 0.055, 0.26, 'left_upper_arm')
  lUpperArm.position.set(-0.32 * sw, 1.09, 0)
  const rUpperArm = makeTaper(0.065, 0.055, 0.26, 'right_upper_arm')
  rUpperArm.position.set(0.32 * sw, 1.09, 0)

  // ── Lower Arms ────────────────────────────────────────────────────
  const lLowerArm = makeTaper(0.055, 0.04, 0.24, 'left_lower_arm')
  lLowerArm.position.set(-0.32 * sw, 0.82, 0)
  const rLowerArm = makeTaper(0.055, 0.04, 0.24, 'right_lower_arm')
  rLowerArm.position.set(0.32 * sw, 0.82, 0)

  // ── Upper Legs ────────────────────────────────────────────────────
  const lUpperLeg = makeTaper(0.09, 0.075, 0.34, 'left_upper_leg')
  lUpperLeg.position.set(-0.10, 0.55, 0)
  const rUpperLeg = makeTaper(0.09, 0.075, 0.34, 'right_upper_leg')
  rUpperLeg.position.set(0.10, 0.55, 0)

  // ── Lower Legs ────────────────────────────────────────────────────
  const lLowerLeg = makeTaper(0.075, 0.055, 0.34, 'left_lower_leg')
  lLowerLeg.position.set(-0.10, 0.17, 0)
  const rLowerLeg = makeTaper(0.075, 0.055, 0.34, 'right_lower_leg')
  rLowerLeg.position.set(0.10, 0.17, 0)

  // ── Feet ──────────────────────────────────────────────────────────
  const lFoot = part(new THREE.BoxGeometry(0.10, 0.06, 0.18), 'left_foot')
  lFoot.position.set(-0.10, 0.03, 0.04)
  const rFoot = part(new THREE.BoxGeometry(0.10, 0.06, 0.18), 'right_foot')
  rFoot.position.set(0.10, 0.03, 0.04)

  g.add(
    head, neck, torso,
    lShoulder, rShoulder,
    lUpperArm, rUpperArm,
    lLowerArm, rLowerArm,
    lUpperLeg, rUpperLeg,
    lLowerLeg, rLowerLeg,
    lFoot, rFoot,
  )
  return g
}

/** Maps clothing type → segment names that receive the texture. */
export const SEGMENT_MAP = {
  shirt:       ['torso', 'left_shoulder', 'right_shoulder', 'left_upper_arm', 'right_upper_arm'],
  pants:       ['left_upper_leg', 'right_upper_leg', 'left_lower_leg', 'right_lower_leg'],
  hat:         ['head'],
  sunglasses:  ['head'],
  scarf:       ['neck'],
  shoes:       ['left_foot', 'right_foot'],
}

/**
 * Apply a background-removed PNG as a texture to the matching segments.
 * @param {THREE.Group} mannequin
 * @param {string} clothingType  one of the keys in SEGMENT_MAP
 * @param {string} imageUrl      blob: or http: URL of a transparent PNG
 */
export function applyTexture(mannequin, clothingType, imageUrl) {
  const targets = SEGMENT_MAP[clothingType]
  if (!targets) return
  const loader = new THREE.TextureLoader()
  loader.load(imageUrl, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    mannequin.traverse((child) => {
      if (child.isMesh && targets.includes(child.name)) {
        child.material.map?.dispose()
        child.material.dispose()
        child.material = new THREE.MeshPhysicalMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
          roughness: 0.2,
          clearcoat: 0.4,
          clearcoatRoughness: 0.2,
        })
      }
    })
  })
}

/**
 * Uniformly scale the mannequin.
 * @param {THREE.Group} mannequin
 * @param {number} scaleX  width (also applied to Z)
 * @param {number} scaleY  height
 */
export function setScale(mannequin, scaleX, scaleY) {
  mannequin.scale.set(scaleX, scaleY, scaleX)
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Viewer3D/mannequin.js
git commit -m "feat: rebuild mannequin with lathe geometry, MeshPhysicalMaterial, 6 clothing types"
```

---

## Task 3: Scene Upgrade (Lighting + Starfield)

**Files:**
- Modify: `frontend/src/components/Viewer3D/scene.js`

- [ ] **Step 1: Replace `frontend/src/components/Viewer3D/scene.js`**

```js
// frontend/src/components/Viewer3D/scene.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

/**
 * Initialise a Three.js scene bound to a canvas element.
 * Returns { scene, animate, resize, dispose }.
 */
export function createScene(canvas) {
  RectAreaLightUniformsLib.init()

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(canvas.clientWidth || 600, canvas.clientHeight || 800)
  renderer.shadowMap.enabled = true

  const scene = new THREE.Scene()
  // No scene.background — canvas is transparent so the CSS dark bg shows through

  const camera = new THREE.PerspectiveCamera(
    45,
    (canvas.clientWidth || 600) / (canvas.clientHeight || 800),
    0.1,
    100
  )
  camera.position.set(0, 1.2, 3.2)

  // ── Lights ──────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(2, 4, 2)
  scene.add(dirLight)

  // Soft front fill light
  const rectLight = new THREE.RectAreaLight(0xffffff, 2.5, 2, 4)
  rectLight.position.set(0, 1.5, 2)
  rectLight.lookAt(0, 1.0, 0)
  scene.add(rectLight)

  // Purple under-glow
  const purpleLight = new THREE.PointLight(0xa855f7, 1.2, 5)
  purpleLight.position.set(0, 0, 1.5)
  scene.add(purpleLight)

  // ── Starfield ───────────────────────────────────────────────────
  const starPositions = new Float32Array(800 * 3)
  for (let i = 0; i < 800 * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 20
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  })
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)

  // ── Controls ────────────────────────────────────────────────────
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
    // Twinkle: oscillate star opacity with a slow sine wave
    starMat.opacity = 0.5 + 0.3 * Math.sin(Date.now() * 0.0008)
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
    starGeo.dispose()
    starMat.dispose()
    renderer.dispose()
  }

  return { scene, animate, resize, dispose }
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Viewer3D/scene.js
git commit -m "feat: upgrade scene — RectAreaLight, purple point light, twinkling starfield"
```

---

## Task 4: Viewer3D — 4 New Clothing Type Props

**Files:**
- Modify: `frontend/src/components/Viewer3D/Viewer3D.jsx`

- [ ] **Step 1: Replace `frontend/src/components/Viewer3D/Viewer3D.jsx`**

```jsx
// frontend/src/components/Viewer3D/Viewer3D.jsx
import { useEffect, useRef, useState } from 'react'
import { createScene } from './scene'
import { createMannequin, applyTexture, setScale } from './mannequin'

export function Viewer3D({
  gender, scaleX, scaleY,
  shirtUrl, pantsUrl, hatUrl, sunglassesUrl, scarfUrl, shoesUrl,
}) {
  const canvasRef   = useRef(null)
  const sceneRef    = useRef(null)
  const mannequinRef = useRef(null)
  const [hintVisible, setHintVisible] = useState(true)

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

  // Swap mannequin when gender changes — re-apply all active textures
  useEffect(() => {
    if (!sceneRef.current) return
    const { scene } = sceneRef.current
    scene.remove(mannequinRef.current)

    const next = createMannequin(gender)
    mannequinRef.current = next
    scene.add(next)

    if (shirtUrl)      applyTexture(next, 'shirt',      shirtUrl)
    if (pantsUrl)      applyTexture(next, 'pants',      pantsUrl)
    if (hatUrl)        applyTexture(next, 'hat',        hatUrl)
    if (sunglassesUrl) applyTexture(next, 'sunglasses', sunglassesUrl)
    if (scarfUrl)      applyTexture(next, 'scarf',      scarfUrl)
    if (shoesUrl)      applyTexture(next, 'shoes',      shoesUrl)
  }, [gender]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scale
  useEffect(() => {
    if (mannequinRef.current) setScale(mannequinRef.current, scaleX, scaleY)
  }, [scaleX, scaleY])

  // Clothing textures
  useEffect(() => {
    if (mannequinRef.current && shirtUrl) applyTexture(mannequinRef.current, 'shirt', shirtUrl)
  }, [shirtUrl])

  useEffect(() => {
    if (mannequinRef.current && pantsUrl) applyTexture(mannequinRef.current, 'pants', pantsUrl)
  }, [pantsUrl])

  useEffect(() => {
    if (mannequinRef.current && hatUrl) applyTexture(mannequinRef.current, 'hat', hatUrl)
  }, [hatUrl])

  useEffect(() => {
    if (mannequinRef.current && sunglassesUrl) applyTexture(mannequinRef.current, 'sunglasses', sunglassesUrl)
  }, [sunglassesUrl])

  useEffect(() => {
    if (mannequinRef.current && scarfUrl) applyTexture(mannequinRef.current, 'scarf', scarfUrl)
  }, [scarfUrl])

  useEffect(() => {
    if (mannequinRef.current && shoesUrl) applyTexture(mannequinRef.current, 'shoes', shoesUrl)
  }, [shoesUrl])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onPointerDown={() => setHintVisible(false)}
      />
      {hintVisible && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/30 pointer-events-none select-none">
          Drag to rotate · Scroll to zoom
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Viewer3D/Viewer3D.jsx
git commit -m "feat: extend Viewer3D with hat, sunglasses, scarf, shoes texture props and camera hint"
```

---

## Task 5: Controls Redesign

**Files:**
- Modify: `frontend/src/components/Controls/Controls.jsx`
- Modify: `frontend/src/components/Controls/__tests__/Controls.test.jsx`

- [ ] **Step 1: Update `Controls.test.jsx` first (tests will fail until implementation)**

Replace the entire file:

```jsx
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

test('clicking Female calls onToggleGender', () => {
  const onToggle = vi.fn()
  render(<Controls {...defaults} onToggleGender={onToggle} />)
  fireEvent.click(screen.getByText('Female'))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('clicking Male calls onToggleGender', () => {
  const onToggle = vi.fn()
  render(<Controls {...defaults} onToggleGender={onToggle} />)
  fireEvent.click(screen.getByText('Male'))
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

test('renders Height and Width labels', () => {
  render(<Controls {...defaults} />)
  expect(screen.getByText('Height')).toBeInTheDocument()
  expect(screen.getByText('Width')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to confirm failures**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test -- --reporter=verbose 2>&1 | grep -A3 "Controls"
```

Expected: `bg-gray-900`-based tests removed, all 6 should pass already since we kept behavioral tests.

- [ ] **Step 3: Replace `frontend/src/components/Controls/Controls.jsx`**

```jsx
// frontend/src/components/Controls/Controls.jsx
export function Controls({ gender, onToggleGender, scaleY, onScaleYChange, scaleX, onScaleXChange }) {
  const pct = (val) => (val >= 1 ? '+' : '') + Math.round((val - 1) * 100) + '%'

  return (
    <div className="glass flex items-center gap-5 px-5 py-3 border-t border-white/10 flex-shrink-0">
      {/* Sliding pill gender toggle */}
      <div className="relative flex rounded-full bg-white/10 p-0.5 flex-shrink-0">
        <div
          className="absolute top-0.5 bottom-0.5 w-1/2 rounded-full bg-purple-500 transition-transform duration-200 ease-out"
          style={{ transform: gender === 'female' ? 'translateX(100%)' : 'translateX(0%)' }}
        />
        {['male', 'female'].map(g => (
          <button
            key={g}
            onClick={onToggleGender}
            className="relative z-10 px-4 py-1 text-sm font-medium text-white/80 capitalize rounded-full"
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-300 w-12 flex-shrink-0">Height</span>
          <input
            type="range" min={0.8} max={1.2} step={0.01}
            value={scaleY}
            onChange={e => onScaleYChange(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500 min-w-0"
          />
          <span className="text-xs text-white/40 w-9 text-right flex-shrink-0">{pct(scaleY)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-300 w-12 flex-shrink-0">Width</span>
          <input
            type="range" min={0.8} max={1.2} step={0.01}
            value={scaleX}
            onChange={e => onScaleXChange(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500 min-w-0"
          />
          <span className="text-xs text-white/40 w-9 text-right flex-shrink-0">{pct(scaleX)}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: all tests pass (6 Controls tests + all others).

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Controls/Controls.jsx \
        frontend/src/components/Controls/__tests__/Controls.test.jsx
git commit -m "feat: redesign Controls with sliding pill toggle and purple sliders"
```

---

## Task 6: ClothingItem Redesign

**Files:**
- Modify: `frontend/src/components/Closet/ClothingItem.jsx`
- Modify: `frontend/src/components/Closet/__tests__/Closet.test.jsx`

- [ ] **Step 1: Update `Closet.test.jsx` assertions for new class names**

Replace the entire file:

```jsx
// frontend/src/components/Closet/__tests__/Closet.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ClothingItem } from '../ClothingItem'

const item = { id: '1', type: 'shirt', url: 'blob:test', name: 'shirt.png', colors: [] }

test('renders item thumbnail', () => {
  render(<ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByAltText('shirt.png')).toBeInTheDocument()
})

test('active item has purple ring class', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={true} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild.className).toContain('ring-purple-500')
})

test('inactive item does not have ring-purple-500', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild.className).not.toContain('ring-purple-500')
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

- [ ] **Step 2: Run tests to confirm failures**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: `active item has purple ring class` fails (current component has `border-gray-900`).

- [ ] **Step 3: Replace `frontend/src/components/Closet/ClothingItem.jsx`**

```jsx
// frontend/src/components/Closet/ClothingItem.jsx
export function ClothingItem({ item, isActive, onSelect, onRemove }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
        isActive
          ? 'ring-2 ring-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.55)]'
          : 'border border-white/10 hover:border-purple-400/50'
      }`}
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <img src={item.url} alt={item.name} className="w-full h-full object-contain p-1" />
      <button
        onClick={e => { e.stopPropagation(); onRemove(item.id) }}
        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white/70
                   text-xs flex items-center justify-center hover:bg-red-500/80 transition-colors"
      >
        ×
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Closet/ClothingItem.jsx \
        frontend/src/components/Closet/__tests__/Closet.test.jsx
git commit -m "feat: redesign ClothingItem with purple glow active state and glass card"
```

---

## Task 7: Closet Redesign — 6 Collapsible Sections

**Files:**
- Modify: `frontend/src/components/Closet/Closet.jsx`
- Modify: `frontend/src/components/Closet/__tests__/Closet.test.jsx`

**Interface change:** `Closet` now receives `activeMap` (object `{ shirt, pants, hat, sunglasses, scarf, shoes }`) instead of separate `activeShirt` / `activePants` props.

- [ ] **Step 1: Replace `Closet.test.jsx` with the complete updated file**

```jsx
// frontend/src/components/Closet/__tests__/Closet.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ClothingItem } from '../ClothingItem'
import { Closet } from '../Closet'

vi.mock('../../../services/api', () => ({
  uploadClothing: vi.fn(),
}))

// ── ClothingItem tests ────────────────────────────────────────────────────
const item = { id: '1', type: 'shirt', url: 'blob:test', name: 'shirt.png', colors: [] }

test('renders item thumbnail', () => {
  render(<ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByAltText('shirt.png')).toBeInTheDocument()
})

test('active item has purple ring class', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={true} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild.className).toContain('ring-purple-500')
})

test('inactive item does not have ring-purple-500', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild.className).not.toContain('ring-purple-500')
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

// ── Closet section tests ──────────────────────────────────────────────────
const emptyActiveMap = { shirt: null, pants: null, hat: null, sunglasses: null, scarf: null, shoes: null }

test('Closet renders all 6 section labels', () => {
  render(
    <Closet
      items={[]}
      activeMap={emptyActiveMap}
      onAddItem={vi.fn()}
      onRemoveItem={vi.fn()}
      onSelectItem={vi.fn()}
    />
  )
  expect(screen.getByText('Shirts')).toBeInTheDocument()
  expect(screen.getByText('Pants')).toBeInTheDocument()
  expect(screen.getByText('Hats')).toBeInTheDocument()
  expect(screen.getByText('Sunglasses')).toBeInTheDocument()
  expect(screen.getByText('Scarves')).toBeInTheDocument()
  expect(screen.getByText('Shoes')).toBeInTheDocument()
})

test('Closet renders Digital Closet heading', () => {
  render(
    <Closet
      items={[]}
      activeMap={emptyActiveMap}
      onAddItem={vi.fn()}
      onRemoveItem={vi.fn()}
      onSelectItem={vi.fn()}
    />
  )
  expect(screen.getByText('Digital Closet')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to confirm section tests fail**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: The 2 new Closet tests fail (import mismatch or missing sections).

- [ ] **Step 3: Replace `frontend/src/components/Closet/Closet.jsx`**

```jsx
// frontend/src/components/Closet/Closet.jsx
import { useRef, useState } from 'react'
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

const SECTIONS = [
  { label: 'Shirts',      type: 'shirt'       },
  { label: 'Pants',       type: 'pants'       },
  { label: 'Hats',        type: 'hat'         },
  { label: 'Sunglasses',  type: 'sunglasses'  },
  { label: 'Scarves',     type: 'scarf'       },
  { label: 'Shoes',       type: 'shoes'       },
]

function Section({ label, inputRef, type, clothingItems, activeItem, onUpload, onSelectItem, onRemoveItem }) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <span className="text-xs text-purple-300 uppercase tracking-[0.15em]">{label}</span>
        <span
          className="text-purple-400 text-xs transition-transform duration-200"
          style={{ display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => onUpload(e.target.files?.[0], type)}
          />
          <div className="grid grid-cols-2 gap-2 mb-4">
            {clothingItems.map(item => (
              <ClothingItem
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                onSelect={onSelectItem}
                onRemove={onRemoveItem}
              />
            ))}
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col
                         items-center justify-center gap-1 hover:border-purple-400 hover:bg-purple-500/10
                         transition-colors cursor-pointer"
            >
              <span className="text-white/40 text-xl leading-none">+</span>
              <span className="text-xs text-white/30">Upload</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function Closet({ items, activeMap, onAddItem, onRemoveItem, onSelectItem }) {
  // One ref per section type, keyed by type string
  const refs = {
    shirt:      useRef(null),
    pants:      useRef(null),
    hat:        useRef(null),
    sunglasses: useRef(null),
    scarf:      useRef(null),
    shoes:      useRef(null),
  }

  async function handleUpload(file, type) {
    if (!file) return
    const url = await uploadClothing(file, type)
    const colors = await extractColors(url)
    onAddItem({ id: Date.now().toString(), type, url, name: file.name, colors })
  }

  return (
    <div className="flex flex-col gap-1 p-4 overflow-y-auto h-full">
      <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-[0.2em] mb-3">
        Digital Closet
      </h2>

      {SECTIONS.map(({ label, type }) => (
        <Section
          key={type}
          label={label}
          inputRef={refs[type]}
          type={type}
          clothingItems={items.filter(i => i.type === type)}
          activeItem={activeMap?.[type] ?? null}
          onUpload={handleUpload}
          onSelectItem={onSelectItem}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: all 27 + 2 new = 29 tests pass.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/Closet/Closet.jsx \
        frontend/src/components/Closet/__tests__/Closet.test.jsx
git commit -m "feat: redesign Closet with 6 collapsible sections and activeMap prop"
```

---

## Task 8: OutfitSuggester Redesign

**Files:**
- Modify: `frontend/src/components/OutfitSuggester/OutfitSuggester.jsx`

The existing 4 tests check only behavior (button disabled, empty state text, heading text) — all will keep passing with the new styling.

- [ ] **Step 1: Run existing tests to confirm they still pass before touching the file**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: all tests pass (baseline confirmation).

- [ ] **Step 2: Replace `frontend/src/components/OutfitSuggester/OutfitSuggester.jsx`**

```jsx
// frontend/src/components/OutfitSuggester/OutfitSuggester.jsx
import { useState } from 'react'
import { getSuggestions } from '../../services/api'

export function OutfitSuggester({ items }) {
  const [swatches, setSwatches]     = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  async function handleSuggest() {
    const colors = items.flatMap(i => i.colors)
    if (!colors.length) return
    setLoading(true)
    setError(null)
    try {
      const result = await getSuggestions(colors)
      setSwatches(result.swatches)
      setSuggestions(result.suggestions)
    } catch {
      setError('Could not fetch suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSuggest = !loading && items.length > 0

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-[0.2em]">
        Outfit Suggester
      </h2>

      {/* Gradient button with shimmer */}
      <div className="relative overflow-hidden rounded-lg">
        <button
          onClick={handleSuggest}
          disabled={!canSuggest}
          className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity
                     disabled:opacity-40 relative z-10"
          style={{
            background: canSuggest
              ? 'linear-gradient(135deg, #9333ea, #ec4899)'
              : 'rgba(168,85,247,0.3)',
          }}
        >
          {loading ? 'Analysing…' : 'Suggest Outfit'}
        </button>
        {canSuggest && (
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none"
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {swatches.length > 0 && (
        <div>
          <p className="text-xs text-purple-300 mb-3 uppercase tracking-[0.12em]">Palette</p>
          <div className="flex gap-2 flex-wrap">
            {swatches.map((hex) => (
              <div key={hex} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-full border border-white/20 shadow-lg cursor-pointer
                             hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <span className="text-[10px] text-white/40">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-purple-300 uppercase tracking-[0.12em]">Suggestions</p>
          {suggestions.map((s, i) => (
            <p
              key={`${i}::${s.slice(0, 20)}`}
              className="text-sm text-white/80 rounded-lg p-3 leading-snug border-l-2 border-purple-500"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              {s}
            </p>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-xs text-white/30 text-center mt-6">
          Add clothing items to get suggestions
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run tests — all must pass**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: all tests pass (OutfitSuggester behavioral tests still valid).

- [ ] **Step 4: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/components/OutfitSuggester/OutfitSuggester.jsx
git commit -m "feat: redesign OutfitSuggester with gradient button, shimmer, accent suggestion cards"
```

---

## Task 9: App Redesign — 6 Active States + Glass Layout

**Files:**
- Modify: `frontend/src/App.jsx`

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

  const [activeShirt,      setActiveShirt]      = useState(null)
  const [activePants,      setActivePants]      = useState(null)
  const [activeHat,        setActiveHat]        = useState(null)
  const [activeSunglasses, setActiveSunglasses] = useState(null)
  const [activeScarf,      setActiveScarf]      = useState(null)
  const [activeShoes,      setActiveShoes]      = useState(null)

  const setters = {
    shirt:      setActiveShirt,
    pants:      setActivePants,
    hat:        setActiveHat,
    sunglasses: setActiveSunglasses,
    scarf:      setActiveScarf,
    shoes:      setActiveShoes,
  }

  function handleSelectItem(item) {
    setters[item.type]?.(item)
  }

  function handleRemoveItem(id) {
    const item = items.find(i => i.id === id)
    if (item) setters[item.type]?.(prev => prev?.id === id ? null : prev)
    removeItem(id)
  }

  const activeMap = {
    shirt:      activeShirt,
    pants:      activePants,
    hat:        activeHat,
    sunglasses: activeSunglasses,
    scarf:      activeScarf,
    shoes:      activeShoes,
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0f35 50%, #0d1b3e 100%)' }}
    >
      {/* Header */}
      <header className="glass flex items-center px-6 h-14 flex-shrink-0 border-b border-white/10 z-10">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          The Digital Mirror
        </h1>
      </header>

      {/* Three-column body */}
      <div className="flex flex-1 min-h-0 p-3 gap-3">
        {/* Left — Digital Closet */}
        <div className="w-60 flex-shrink-0 glass rounded-xl overflow-hidden">
          <Closet
            items={items}
            activeMap={activeMap}
            onAddItem={addItem}
            onRemoveItem={handleRemoveItem}
            onSelectItem={handleSelectItem}
          />
        </div>

        {/* Center — Mannequin */}
        <div className="flex flex-col flex-1 min-w-0 glass rounded-xl overflow-hidden">
          <div className="flex-1 relative" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <Viewer3D
              gender={gender}
              scaleX={scaleX}
              scaleY={scaleY}
              shirtUrl={activeShirt?.url ?? null}
              pantsUrl={activePants?.url ?? null}
              hatUrl={activeHat?.url ?? null}
              sunglassesUrl={activeSunglasses?.url ?? null}
              scarfUrl={activeScarf?.url ?? null}
              shoesUrl={activeShoes?.url ?? null}
            />
            {/* Purple floor glow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.18), transparent 70%)' }}
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
        <div className="w-60 flex-shrink-0 glass rounded-xl overflow-hidden">
          <OutfitSuggester items={items} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
export PATH="/c/Program Files/nodejs:$PATH"
cd C:/Users/fUJITSU/Desktop/cloths/frontend
npm test
```

Expected: all tests pass (29 total).

- [ ] **Step 3: Commit**

```bash
cd C:/Users/fUJITSU/Desktop/cloths
git add frontend/src/App.jsx
git commit -m "feat: App redesign — glass layout, purple gradient, 6 active clothing states"
```

---

## Done

All 9 tasks produce a complete visual overhaul:
- Deep purple starfield background
- Frosted glass panels throughout
- Smooth lathe-geometry mannequin with physical material
- 6 clothing categories (shirt, pants, hat, sunglasses, scarf, shoes)
- Purple glow active states, gradient suggest button, shimmer animation
