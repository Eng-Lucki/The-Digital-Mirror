export function Controls({ gender, onToggleGender, scaleY, onScaleYChange, scaleX, onScaleXChange }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 bg-white border-t border-gray-200">
      {/* Gender toggle */}
      <div className="flex gap-2 justify-center">
        {['male', 'female'].map(g => (
          <button
            key={g}
            onClick={onToggleGender}
            className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              gender === g
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>
      {/* Sliders */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-14">Height</span>
        <input
          type="range" min={0.8} max={1.2} step={0.01}
          value={scaleY}
          onChange={e => onScaleYChange(parseFloat(e.target.value))}
          className="flex-1 accent-gray-900"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-14">Width</span>
        <input
          type="range" min={0.8} max={1.2} step={0.01}
          value={scaleX}
          onChange={e => onScaleXChange(parseFloat(e.target.value))}
          className="flex-1 accent-gray-900"
        />
      </div>
    </div>
  )
}
