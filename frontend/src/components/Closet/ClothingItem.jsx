// frontend/src/components/Closet/ClothingItem.jsx
export function ClothingItem({ item, isActive, onSelect, onRemove }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
        isActive
          ? 'bg-purple-500/20 ring-1 ring-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
          : 'hover:bg-white/5 border border-transparent hover:border-white/10'
      }`}
    >
      {/* Thumbnail — fixed 36×36, never enlarges */}
      <div className="w-9 h-9 flex-shrink-0 rounded-md overflow-hidden bg-white/8 border border-white/10">
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Name + swatches */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/75 truncate leading-tight">{item.name.replace(/\.[^.]+$/, '')}</p>
        {item.colors?.length > 0 && (
          <div className="flex gap-0.5 mt-1">
            {item.colors.slice(0, 4).map(c => (
              <span
                key={c}
                className="w-2 h-2 rounded-full border border-white/20 flex-shrink-0"
                style={{ background: c }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Active indicator dot */}
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
      )}

      {/* Remove button — appears on hover */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(item.id) }}
        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
                   text-white/30 hover:text-white hover:bg-red-500/70 transition-all
                   opacity-0 group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}
