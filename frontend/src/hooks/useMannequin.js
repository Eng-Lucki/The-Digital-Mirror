import { useState } from 'react'

export function useMannequin() {
  const [gender, setGender] = useState('male')
  const [scaleY, setScaleY] = useState(1.0)
  const [scaleX, setScaleX] = useState(1.0)

  function toggleGender() {
    setGender(prev => (prev === 'male' ? 'female' : 'male'))
  }

  return { gender, toggleGender, scaleY, setScaleY, scaleX, setScaleX }
}
