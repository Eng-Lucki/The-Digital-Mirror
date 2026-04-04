import { useState } from 'react'

export function useWardrobe() {
  const [items, setItems] = useState([])

  function addItem(item) {
    // Only one item per type — replace if same type already exists
    setItems(prev => [...prev.filter(i => i.type !== item.type), item])
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function getItemByType(type) {
    return items.find(i => i.type === type) ?? null
  }

  return { items, addItem, removeItem, getItemByType }
}
