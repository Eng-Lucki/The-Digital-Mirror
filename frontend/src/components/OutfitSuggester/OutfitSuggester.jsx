import { useState } from 'react'
import { getSuggestions } from '../../services/api'

export function OutfitSuggester({ items }) {
  const [swatches, setSwatches] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-white border-l border-gray-200 overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
        Outfit Suggester
      </h2>

      <button
        onClick={handleSuggest}
        disabled={loading || items.length === 0}
        className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg
                   disabled:opacity-40 hover:bg-gray-700 transition-colors"
      >
        {loading ? 'Analysing…' : 'Suggest Outfit'}
      </button>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {swatches.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Complementary palette</p>
          <div className="flex gap-2 flex-wrap">
            {swatches.map((hex, i) => (
              <div key={hex} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <span className="text-xs text-gray-400">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">Suggestions</p>
          {suggestions.map((s, i) => (
            <p key={i + s.slice(0, 20)} className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-snug">
              {s}
            </p>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-6">
          Add clothing items to get suggestions
        </p>
      )}
    </div>
  )
}
