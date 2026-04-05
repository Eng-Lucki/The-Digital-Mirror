// frontend/src/components/Closet/ClothingItem.jsx
export function ClothingItem({ item, isActive, onSelect, onRemove }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
        isActive
          ? 'ring-2 ring-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.55)]'
          : 'border border-white/10 hover:border-purple-400/50'
      }`}
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <img src={item.url} alt={item.name} className="w-full h-full object-contain p-1" />
      <button
        onClick={e => { e.stopPropagation(); onRemove(item.id) }}
        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white/70
                   text-xs flex items-center justify-center hover:bg-red-500/80 transition-colors"
      >
        ×
      </button>
    </div>
  )
}
