import { render, screen } from '@testing-library/react'
import { OutfitSuggester } from '../OutfitSuggester'

test('shows empty state when items array is empty', () => {
  render(<OutfitSuggester items={[]} />)
  expect(screen.getByText(/Add clothing items/)).toBeInTheDocument()
})

test('Suggest Outfit button is disabled with no items', () => {
  render(<OutfitSuggester items={[]} />)
  expect(screen.getByRole('button', { name: /Suggest Outfit/i })).toBeDisabled()
})

test('Suggest Outfit button is enabled when items exist', () => {
  const items = [{ id: '1', type: 'shirt', url: 'blob:1', name: 'shirt.png', colors: ['#3a5fa0'] }]
  render(<OutfitSuggester items={items} />)
  expect(screen.getByRole('button', { name: /Suggest Outfit/i })).not.toBeDisabled()
})

test('renders section heading', () => {
  render(<OutfitSuggester items={[]} />)
  expect(screen.getByText(/Outfit Suggester/i)).toBeInTheDocument()
})
