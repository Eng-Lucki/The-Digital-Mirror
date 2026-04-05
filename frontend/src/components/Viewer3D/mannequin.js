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
  neck.position.set(0, 1.52, 0)

  // ── Torso (chest → waist → hip curve) ────────────────────────────
  const torsoPoints = [
    new THREE.Vector2(0.20 * hw, 0),
    new THREE.Vector2(0.155, 0.18),
    new THREE.Vector2(0.19, 0.38),
    new THREE.Vector2(0.22 * sw, 0.58),
  ]
  const torso = part(new THREE.LatheGeometry(torsoPoints, 32), 'torso')
  torso.position.set(0, 0.93, 0)

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
