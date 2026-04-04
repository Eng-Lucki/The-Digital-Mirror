// frontend/src/components/Viewer3D/Viewer3D.jsx
import { useEffect, useRef } from 'react'
import { createScene } from './scene'
import { createMannequin, applyTexture, setScale } from './mannequin'

export function Viewer3D({ gender, scaleX, scaleY, shirtUrl, pantsUrl }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)     // { scene, dispose, resize }
  const mannequinRef = useRef(null)

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

  // Swap mannequin when gender changes
  useEffect(() => {
    if (!sceneRef.current) return
    const { scene } = sceneRef.current
    scene.remove(mannequinRef.current)

    const next = createMannequin(gender)
    mannequinRef.current = next
    scene.add(next)

    if (shirtUrl) applyTexture(next, 'shirt', shirtUrl)
    if (pantsUrl) applyTexture(next, 'pants', pantsUrl)
  }, [gender]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scale
  useEffect(() => {
    if (mannequinRef.current) setScale(mannequinRef.current, scaleX, scaleY)
  }, [scaleX, scaleY])

  // Shirt texture
  useEffect(() => {
    if (mannequinRef.current && shirtUrl) applyTexture(mannequinRef.current, 'shirt', shirtUrl)
  }, [shirtUrl])

  // Pants texture
  useEffect(() => {
    if (mannequinRef.current && pantsUrl) applyTexture(mannequinRef.current, 'pants', pantsUrl)
  }, [pantsUrl])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}
