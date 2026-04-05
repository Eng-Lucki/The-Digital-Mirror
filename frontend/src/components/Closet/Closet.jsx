// frontend/src/components/Closet/Closet.jsx
import { useRef, useState } from 'react'
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

const SECTIONS = [
  { label: 'Shirts',      type: 'shirt'       },
  { label: 'Pants',       type: 'pants'       },
  { label: 'Hats',        type: 'hat'         },
  { label: 'Sunglasses',  type: 'sunglasses'  },
  { label: 'Scarves',     type: 'scarf'       },
  { label: 'Shoes',       type: 'shoes'       },
]

function Section({ label, inputRef, type, clothingItems, activeItem, onUpload, onSelectItem, onRemoveItem }) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <span className="text-xs text-purple-300 uppercase tracking-[0.15em]">{label}</span>
        <span
          className="text-purple-400 text-xs transition-transform duration-200"
          style={{ display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => onUpload(e.target.files?.[0], type)}
          />
          <div className="grid grid-cols-2 gap-2 mb-4">
            {clothingItems.map(item => (
              <ClothingItem
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                onSelect={onSelectItem}
                onRemove={onRemoveItem}
              />
            ))}
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col
                         items-center justify-center gap-1 hover:border-purple-400 hover:bg-purple-500/10
                         transition-colors cursor-pointer"
            >
              <span className="text-white/40 text-xl leading-none">+</span>
              <span className="text-xs text-white/30">Upload</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function Closet({ items, activeMap, onAddItem, onRemoveItem, onSelectItem }) {
  const shirtRef      = useRef(null)
  const pantsRef      = useRef(null)
  const hatRef        = useRef(null)
  const sunglassesRef = useRef(null)
  const scarfRef      = useRef(null)
  const shoesRef      = useRef(null)
  const refs = {
    shirt:      shirtRef,
    pants:      pantsRef,
    hat:        hatRef,
    sunglasses: sunglassesRef,
    scarf:      scarfRef,
    shoes:      shoesRef,
  }

  async function handleUpload(file, type) {
    if (!file) return
    const url = await uploadClothing(file, type)
    const colors = await extractColors(url)
    onAddItem({ id: Date.now().toString(), type, url, name: file.name, colors })
  }

  return (
    <div className="flex flex-col gap-1 p-4 overflow-y-auto h-full">
      <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-[0.2em] mb-3">
        Digital Closet
      </h2>

      {SECTIONS.map(({ label, type }) => (
        <Section
          key={type}
          label={label}
          inputRef={refs[type]}
          type={type}
          clothingItems={items.filter(i => i.type === type)}
          activeItem={activeMap?.[type] ?? null}
          onUpload={handleUpload}
          onSelectItem={onSelectItem}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  )
}
