// frontend/src/components/Controls/Controls.jsx
export function Controls({ gender, onToggleGender, scaleY, onScaleYChange, scaleX, onScaleXChange }) {
  const pct = (val) => (val >= 1 ? '+' : '') + Math.round((val - 1) * 100) + '%'

  return (
    <div className="glass flex items-center gap-5 px-5 py-3 border-t border-white/10 flex-shrink-0">
      {/* Sliding pill gender toggle */}
      <div className="relative flex rounded-full bg-white/10 p-0.5 flex-shrink-0">
        <div
          className="absolute top-0.5 bottom-0.5 w-1/2 rounded-full bg-purple-500 transition-transform duration-200 ease-out"
          style={{ transform: gender === 'female' ? 'translateX(100%)' : 'translateX(0%)' }}
        />
        {['male', 'female'].map(g => (
          <button
            key={g}
            onClick={onToggleGender}
            className="relative z-10 px-4 py-1 text-sm font-medium text-white/80 capitalize rounded-full"
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-300 w-12 flex-shrink-0">Height</span>
          <input
            type="range" min={0.8} max={1.2} step={0.01}
            value={scaleY}
            onChange={e => onScaleYChange(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500 min-w-0"
          />
          <span className="text-xs text-white/40 w-9 text-right flex-shrink-0">{pct(scaleY)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-300 w-12 flex-shrink-0">Width</span>
          <input
            type="range" min={0.8} max={1.2} step={0.01}
            value={scaleX}
            onChange={e => onScaleXChange(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500 min-w-0"
          />
          <span className="text-xs text-white/40 w-9 text-right flex-shrink-0">{pct(scaleX)}</span>
        </div>
      </div>
    </div>
  )
}
