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

function makeTaper(rBottom, rTop, height, name) {
  const points = [
    new THREE.Vector2(rBottom, 0),
    new THREE.Vector2((rBottom + rTop) / 2, height / 2),
    new THREE.Vector2(rTop, height),
  ]
  return part(new THREE.LatheGeometry(points, 32), name)
}

export function createMannequin(gender) {
  const isFemale = gender === 'female'
  const sw = isFemale ? 0.88 : 1.0
  const hw = isFemale ? 1.08 : 1.0

  const g = new THREE.Group()
  g.name = 'mannequin'

  const head = part(new THREE.SphereGeometry(0.12, 32, 32), 'head')
  head.position.set(0, 1.75, 0)

  const neck = makeTaper(0.045, 0.05, 0.12, 'neck')
  neck.position.set(0, 1.52, 0)

  const torsoPoints = [
    new THREE.Vector2(0.20 * hw, 0),
    new THREE.Vector2(0.155, 0.18),
    new THREE.Vector2(0.19, 0.38),
    new THREE.Vector2(0.22 * sw, 0.58),
  ]
  const torso = part(new THREE.LatheGeometry(torsoPoints, 32), 'torso')
  torso.position.set(0, 0.93, 0)

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

  const lUpperArm = makeTaper(0.065, 0.055, 0.26, 'left_upper_arm')
  lUpperArm.position.set(-0.32 * sw, 1.09, 0)
  const rUpperArm = makeTaper(0.065, 0.055, 0.26, 'right_upper_arm')
  rUpperArm.position.set(0.32 * sw, 1.09, 0)

  const lLowerArm = makeTaper(0.055, 0.04, 0.24, 'left_lower_arm')
  lLowerArm.position.set(-0.32 * sw, 0.82, 0)
  const rLowerArm = makeTaper(0.055, 0.04, 0.24, 'right_lower_arm')
  rLowerArm.position.set(0.32 * sw, 0.82, 0)

  const lUpperLeg = makeTaper(0.09, 0.075, 0.34, 'left_upper_leg')
  lUpperLeg.position.set(-0.10, 0.55, 0)
  const rUpperLeg = makeTaper(0.09, 0.075, 0.34, 'right_upper_leg')
  rUpperLeg.position.set(0.10, 0.55, 0)

  const lLowerLeg = makeTaper(0.075, 0.055, 0.34, 'left_lower_leg')
  lLowerLeg.position.set(-0.10, 0.17, 0)
  const rLowerLeg = makeTaper(0.075, 0.055, 0.34, 'right_lower_leg')
  rLowerLeg.position.set(0.10, 0.17, 0)

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

/**
 * Clothing plane configs: position and size of the flat image overlay for each type.
 * Coordinates are in mannequin-local space.
 * y = vertical center, z = forward offset, w/h = plane dimensions
 */
const CLOTHING_PLANES = {
  shirt:      { w: 0.56, h: 0.62, y: 1.22, z: 0.26 },
  pants:      { w: 0.42, h: 0.74, y: 0.52, z: 0.22 },
  hat:        { w: 0.30, h: 0.22, y: 1.83, z: 0.14 },
  sunglasses: { w: 0.22, h: 0.09, y: 1.73, z: 0.14 },
  scarf:      { w: 0.28, h: 0.16, y: 1.57, z: 0.12 },
  shoes:      { w: 0.36, h: 0.13, y: 0.05, z: 0.16 },
}

/**
 * Apply a clothing image as a flat plane overlay positioned in front of the
 * corresponding body area. Much better than UV-mapping onto curved geometry.
 */
export function applyClothing(mannequin, clothingType, imageUrl) {
  // Remove any existing plane for this type first
  removeClothing(mannequin, clothingType)

  const cfg = CLOTHING_PLANES[clothingType]
  if (!cfg) return

  const loader = new THREE.TextureLoader()
  loader.load(imageUrl, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    const geo = new THREE.PlaneGeometry(cfg.w, cfg.h)
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
      depthTest: false,
    })
    const plane = new THREE.Mesh(geo, mat)
    plane.name = `clothing_${clothingType}`
    plane.renderOrder = 1
    plane.position.set(0, cfg.y, cfg.z)
    mannequin.add(plane)
  })
}

/**
 * Remove the clothing plane for the given type.
 */
export function removeClothing(mannequin, clothingType) {
  const existing = mannequin.getObjectByName(`clothing_${clothingType}`)
  if (existing) {
    existing.material.map?.dispose()
    existing.material.dispose()
    existing.geometry.dispose()
    mannequin.remove(existing)
  }
}

export function setScale(mannequin, scaleX, scaleY) {
  mannequin.scale.set(scaleX, scaleY, scaleX)
}
