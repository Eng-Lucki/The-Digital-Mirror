// frontend/src/components/Viewer3D/Viewer3D.jsx
import { useEffect, useRef, useState } from 'react'
import { createScene } from './scene'
import { createMannequin, applyTexture, setScale } from './mannequin'

export function Viewer3D({
  gender, scaleX, scaleY,
  shirtUrl, pantsUrl, hatUrl, sunglassesUrl, scarfUrl, shoesUrl,
}) {
  const canvasRef    = useRef(null)
  const sceneRef     = useRef(null)
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
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white/30 pointer-events-none select-none whitespace-nowrap">
          Drag to rotate · Scroll to zoom
        </p>
      )}
    </div>
  )
}
