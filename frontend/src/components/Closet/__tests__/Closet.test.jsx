// frontend/src/components/Closet/__tests__/Closet.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ClothingItem } from '../ClothingItem'
import { Closet } from '../Closet'

vi.mock('../../../services/api', () => ({
  uploadClothing: vi.fn(),
}))

// ── ClothingItem tests ────────────────────────────────────────────────────
const item = { id: '1', type: 'shirt', url: 'blob:test', name: 'shirt.png', colors: [] }

test('renders item thumbnail', () => {
  render(<ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByAltText('shirt.png')).toBeInTheDocument()
})

test('active item has purple ring class', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={true} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild.className).toContain('ring-purple-500')
})

test('inactive item does not have ring-purple-500', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild.className).not.toContain('ring-purple-500')
})

test('calls onSelect with item when clicked', () => {
  const onSelect = vi.fn()
  render(<ClothingItem item={item} isActive={false} onSelect={onSelect} onRemove={vi.fn()} />)
  fireEvent.click(screen.getByAltText('shirt.png'))
  expect(onSelect).toHaveBeenCalledWith(item)
})

test('calls onRemove with item id when × clicked', () => {
  const onRemove = vi.fn()
  render(<ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={onRemove} />)
  fireEvent.click(screen.getByText('×'))
  expect(onRemove).toHaveBeenCalledWith('1')
})

// ── Closet section tests ──────────────────────────────────────────────────
const emptyActiveMap = { shirt: null, pants: null, hat: null, sunglasses: null, scarf: null, shoes: null }

test('Closet renders all 6 section labels', () => {
  render(
    <Closet
      items={[]}
      activeMap={emptyActiveMap}
      onAddItem={vi.fn()}
      onRemoveItem={vi.fn()}
      onSelectItem={vi.fn()}
    />
  )
  expect(screen.getByText('Shirts')).toBeInTheDocument()
  expect(screen.getByText('Pants')).toBeInTheDocument()
  expect(screen.getByText('Hats')).toBeInTheDocument()
  expect(screen.getByText('Sunglasses')).toBeInTheDocument()
  expect(screen.getByText('Scarves')).toBeInTheDocument()
  expect(screen.getByText('Shoes')).toBeInTheDocument()
})

test('Closet renders Digital Closet heading', () => {
  render(
    <Closet
      items={[]}
      activeMap={emptyActiveMap}
      onAddItem={vi.fn()}
      onRemoveItem={vi.fn()}
      onSelectItem={vi.fn()}
    />
  )
  expect(screen.getByText('Digital Closet')).toBeInTheDocument()
})
