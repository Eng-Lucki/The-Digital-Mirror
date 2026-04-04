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
