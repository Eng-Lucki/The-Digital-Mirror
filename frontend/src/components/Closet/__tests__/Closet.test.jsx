// frontend/src/components/Closet/__tests__/Closet.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ClothingItem } from '../ClothingItem'

const item = { id: '1', type: 'shirt', url: 'blob:test', name: 'shirt.png', colors: [] }

test('renders item thumbnail', () => {
  render(<ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByAltText('shirt.png')).toBeInTheDocument()
})

test('shows active border when isActive is true', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={true} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild).toHaveClass('border-gray-900')
})

test('shows inactive border when isActive is false', () => {
  const { container } = render(
    <ClothingItem item={item} isActive={false} onSelect={vi.fn()} onRemove={vi.fn()} />
  )
  expect(container.firstChild).toHaveClass('border-gray-200')
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
