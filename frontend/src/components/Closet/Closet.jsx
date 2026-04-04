// frontend/src/components/Closet/Closet.jsx
import { useRef } from 'react'
import { ClothingItem } from './ClothingItem'
import { uploadClothing } from '../../services/api'
import ColorThief from 'color-thief-browser'

const colorThief = new ColorThief()

function extractColors(imageUrl) {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const palette = colorThief.getPalette(img, 2) || []
        resolve(
          palette.map(([r, g, b]) =>
            '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
          )
        )
      } catch {
        resolve(['#888888'])
      }
    }
    img.onerror = () => resolve(['#888888'])
    img.src = imageUrl
  })
}

function Section({ label, inputRef, type, clothingItems, activeItem, onUpload, onSelectItem, onRemoveItem }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs font-semibold text-gray-900 hover:underline"
        >
          + Add
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => onUpload(e.target.files?.[0], type)}
      />
      <div className="grid grid-cols-2 gap-2">
        {clothingItems.map(item => (
          <ClothingItem
            key={item.id}
            item={item}
            isActive={activeItem?.id === item.id}
            onSelect={onSelectItem}
            onRemove={onRemoveItem}
          />
        ))}
      </div>
    </div>
  )
}

export function Closet({ items, activeShirt, activePants, onAddItem, onRemoveItem, onSelectItem }) {
  const shirtRef = useRef(null)
  const pantsRef = useRef(null)

  async function handleUpload(file, type) {
    if (!file) return
    const url = await uploadClothing(file, type)
    const colors = await extractColors(url)
    onAddItem({ id: Date.now().toString(), type, url, name: file.name, colors })
  }

  const shirts = items.filter(i => i.type === 'shirt')
  const pants = items.filter(i => i.type === 'pants')

  return (
    <div className="flex flex-col gap-5 p-4 overflow-y-auto h-full bg-white border-r border-gray-200">
      <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
        Digital Closet
      </h2>
      <Section label="Shirts" inputRef={shirtRef} type="shirt" clothingItems={shirts} activeItem={activeShirt} onUpload={handleUpload} onSelectItem={onSelectItem} onRemoveItem={onRemoveItem} />
      <Section label="Pants" inputRef={pantsRef} type="pants" clothingItems={pants} activeItem={activePants} onUpload={handleUpload} onSelectItem={onSelectItem} onRemoveItem={onRemoveItem} />
    </div>
  )
}
