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
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-1 group"
      >
        <span className="text-[10px] font-semibold text-purple-400/80 uppercase tracking-[0.18em]">{label}</span>
        <span
          className="text-purple-500/60 text-[9px] transition-transform duration-200"
          style={{ display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="mb-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => onUpload(e.target.files?.[0], type)}
          />

          <div className="flex flex-col gap-0.5">
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

          <button
            onClick={() => inputRef.current?.click()}
            className="mt-1 w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                       border border-dashed border-white/15 text-white/30
                       hover:border-purple-400/50 hover:text-purple-300 hover:bg-purple-500/8
                       transition-all text-xs"
          >
            <span className="text-base leading-none">+</span>
            <span>Add {label.slice(0, -1)}</span>
          </button>
        </div>
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

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  async function handleUpload(file, type) {
    if (!file) return
    setUploading(true)
    setUploadError(null)
    let url
    try {
      url = await uploadClothing(file, type)
    } catch {
      setUploadError('Upload failed — is the server running?')
      setUploading(false)
      return
    }
    const colors = await extractColors(url)
    onAddItem({ id: Date.now().toString(), type, url, name: file.name, colors })
    setUploading(false)
  }

  return (
    <div className="flex flex-col p-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-[0.2em]">Closet</h2>
        <span className="text-[10px] text-purple-400/60">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      {uploading && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <p className="text-xs text-purple-300">Uploading…</p>
        </div>
      )}
      {uploadError && (
        <p className="text-xs text-red-400 mb-2 px-2">{uploadError}</p>
      )}

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
