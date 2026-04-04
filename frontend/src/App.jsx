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
  const [activeShirt, setActiveShirt] = useState(null)
  const [activePants, setActivePants] = useState(null)

  function handleSelectItem(item) {
    if (item.type === 'shirt') setActiveShirt(item)
    if (item.type === 'pants') setActivePants(item)
  }

  function handleRemoveItem(id) {
    if (activeShirt?.id === id) setActiveShirt(null)
    if (activePants?.id === id) setActivePants(null)
    removeItem(id)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-6 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <h1 className="text-base font-bold text-gray-900 tracking-tight">Virtual Wardrobe</h1>
      </header>

      {/* Three-column body */}
      <div className="flex flex-1 min-h-0">
        {/* Left — Digital Closet */}
        <div className="w-52 flex-shrink-0 overflow-hidden">
          <Closet
            items={items}
            activeShirt={activeShirt}
            activePants={activePants}
            onAddItem={addItem}
            onRemoveItem={handleRemoveItem}
            onSelectItem={handleSelectItem}
          />
        </div>

        {/* Center — Mannequin */}
        <div className="flex flex-col flex-1 min-w-0 border-x border-gray-200">
          <div className="flex-1 relative bg-gray-50">
            <Viewer3D
              gender={gender}
              scaleX={scaleX}
              scaleY={scaleY}
              shirtUrl={activeShirt?.url ?? null}
              pantsUrl={activePants?.url ?? null}
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
        <div className="w-52 flex-shrink-0 overflow-hidden">
          <OutfitSuggester items={items} />
        </div>
      </div>
    </div>
  )
}
