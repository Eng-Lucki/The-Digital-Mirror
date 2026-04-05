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
