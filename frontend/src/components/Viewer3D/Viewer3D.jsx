// frontend/src/components/Viewer3D/Viewer3D.jsx
import { useEffect, useRef, useState } from 'react'
import { createScene } from './scene'
import { createMannequin, applyClothing, removeClothing, setScale } from './mannequin'

const CLOTHING_TYPES = ['shirt', 'pants', 'hat', 'sunglasses', 'scarf', 'shoes']

export function Viewer3D({
  gender, scaleX, scaleY,
  shirtUrl, pantsUrl, hatUrl, sunglassesUrl, scarfUrl, shoesUrl,
}) {
  const canvasRef    = useRef(null)
  const sceneRef     = useRef(null)
  const mannequinRef = useRef(null)
  const [hintVisible, setHintVisible] = useState(true)

  const urlMap = { shirt: shirtUrl, pants: pantsUrl, hat: hatUrl, sunglasses: sunglassesUrl, scarf: scarfUrl, shoes: shoesUrl }

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

  // Swap mannequin on gender change — re-apply all active clothing
  useEffect(() => {
    if (!sceneRef.current) return
    const { scene } = sceneRef.current
    scene.remove(mannequinRef.current)

    const next = createMannequin(gender)
    mannequinRef.current = next
    scene.add(next)

    CLOTHING_TYPES.forEach(type => {
      const url = urlMap[type]
      if (url) applyClothing(next, type, url)
    })
  }, [gender]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scale
  useEffect(() => {
    if (mannequinRef.current) setScale(mannequinRef.current, scaleX, scaleY)
  }, [scaleX, scaleY])

  // Clothing — apply or remove each type when its URL changes
  useEffect(() => {
    if (!mannequinRef.current) return
    shirtUrl ? applyClothing(mannequinRef.current, 'shirt', shirtUrl) : removeClothing(mannequinRef.current, 'shirt')
  }, [shirtUrl])

  useEffect(() => {
    if (!mannequinRef.current) return
    pantsUrl ? applyClothing(mannequinRef.current, 'pants', pantsUrl) : removeClothing(mannequinRef.current, 'pants')
  }, [pantsUrl])

  useEffect(() => {
    if (!mannequinRef.current) return
    hatUrl ? applyClothing(mannequinRef.current, 'hat', hatUrl) : removeClothing(mannequinRef.current, 'hat')
  }, [hatUrl])

  useEffect(() => {
    if (!mannequinRef.current) return
    sunglassesUrl ? applyClothing(mannequinRef.current, 'sunglasses', sunglassesUrl) : removeClothing(mannequinRef.current, 'sunglasses')
  }, [sunglassesUrl])

  useEffect(() => {
    if (!mannequinRef.current) return
    scarfUrl ? applyClothing(mannequinRef.current, 'scarf', scarfUrl) : removeClothing(mannequinRef.current, 'scarf')
  }, [scarfUrl])

  useEffect(() => {
    if (!mannequinRef.current) return
    shoesUrl ? applyClothing(mannequinRef.current, 'shoes', shoesUrl) : removeClothing(mannequinRef.current, 'shoes')
  }, [shoesUrl])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onPointerDown={() => setHintVisible(false)}
      />
      {hintVisible && (
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/30 pointer-events-none select-none whitespace-nowrap">
          Drag to rotate · Scroll to zoom
        </p>
      )}
    </div>
  )
}
