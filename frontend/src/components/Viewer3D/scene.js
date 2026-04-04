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
