// frontend/src/components/OutfitSuggester/OutfitSuggester.jsx
import { useState } from 'react'
import { getSuggestions } from '../../services/api'

export function OutfitSuggester({ items }) {
  const [swatches, setSwatches]       = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  async function handleSuggest() {
    const colors = items.flatMap(i => i.colors)
    if (!colors.length) return
    setLoading(true)
    setError(null)
    try {
      const result = await getSuggestions(colors)
      setSwatches(result.swatches)
      setSuggestions(result.suggestions)
    } catch {
      setError('Could not fetch suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSuggest = !loading && items.length > 0

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-[0.2em]">
        Outfit Suggester
      </h2>

      {/* Gradient button with shimmer */}
      <div className="relative overflow-hidden rounded-lg">
        <button
          onClick={handleSuggest}
          disabled={!canSuggest}
          className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity
                     disabled:opacity-40 relative z-10"
          style={{
            background: canSuggest
              ? 'linear-gradient(135deg, #9333ea, #ec4899)'
              : 'rgba(168,85,247,0.3)',
          }}
        >
          {loading ? 'Analysing…' : 'Suggest Outfit'}
        </button>
        {canSuggest && (
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none"
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {swatches.length > 0 && (
        <div>
          <p className="text-xs text-purple-300 mb-3 uppercase tracking-[0.12em]">Palette</p>
          <div className="flex gap-2 flex-wrap">
            {swatches.map((hex) => (
              <div key={hex} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-full border border-white/20 shadow-lg cursor-pointer
                             hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <span className="text-[10px] text-white/40">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-purple-300 uppercase tracking-[0.12em]">Suggestions</p>
          {suggestions.map((s, i) => (
            <p
              key={`${i}::${s.slice(0, 20)}`}
              className="text-sm text-white/80 rounded-lg p-3 leading-snug border-l-2 border-purple-500"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              {s}
            </p>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-xs text-white/30 text-center mt-6">
          Add clothing items to get suggestions
        </p>
      )}
    </div>
  )
}
