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

  function handleAddItem(item) {
    addItem(item)
    setters[item.type]?.(item)
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
            onAddItem={handleAddItem}
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
