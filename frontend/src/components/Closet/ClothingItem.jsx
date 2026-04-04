// frontend/src/components/Closet/ClothingItem.jsx
export function ClothingItem({ item, isActive, onSelect, onRemove }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className={`relative cursor-pointer rounded-lg border-2 p-1 transition-colors ${
        isActive ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <img
        src={item.url}
        alt={item.name}
        className="w-full h-20 object-contain bg-gray-50 rounded"
      />
      <button
        onClick={e => { e.stopPropagation(); onRemove(item.id) }}
        className="absolute top-1 right-1 w-5 h-5 bg-red-400 text-white rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600"
      >
        ×
      </button>
      <p className="text-xs text-gray-500 truncate mt-1 px-0.5">{item.name}</p>
    </div>
  )
}
