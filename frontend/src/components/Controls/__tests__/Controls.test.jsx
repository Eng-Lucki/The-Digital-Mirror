import { render, screen, fireEvent } from '@testing-library/react'
import { Controls } from '../Controls'

const defaults = {
  gender: 'male',
  onToggleGender: vi.fn(),
  scaleY: 1.0,
  onScaleYChange: vi.fn(),
  scaleX: 1.0,
  onScaleXChange: vi.fn(),
}

test('renders Male and Female buttons', () => {
  render(<Controls {...defaults} />)
  expect(screen.getByText('Male')).toBeInTheDocument()
  expect(screen.getByText('Female')).toBeInTheDocument()
})

test('clicking Female calls onToggleGender', () => {
  const onToggle = vi.fn()
  render(<Controls {...defaults} onToggleGender={onToggle} />)
  fireEvent.click(screen.getByText('Female'))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('clicking already-active Male does not call onToggleGender', () => {
  const onToggle = vi.fn()
  render(<Controls {...defaults} gender="male" onToggleGender={onToggle} />)
  fireEvent.click(screen.getByText('Male'))
  expect(onToggle).not.toHaveBeenCalled()
})

test('clicking inactive Male calls onToggleGender', () => {
  const onToggle = vi.fn()
  render(<Controls {...defaults} gender="female" onToggleGender={onToggle} />)
  fireEvent.click(screen.getByText('Male'))
  expect(onToggle).toHaveBeenCalledTimes(1)
})

test('height slider has correct value', () => {
  render(<Controls {...defaults} scaleY={1.1} />)
  const sliders = screen.getAllByRole('slider')
  expect(sliders[0]).toHaveValue('1.1')
})

test('width slider fires onScaleXChange', () => {
  const onScaleXChange = vi.fn()
  render(<Controls {...defaults} onScaleXChange={onScaleXChange} />)
  fireEvent.change(screen.getAllByRole('slider')[1], { target: { value: '0.9' } })
  expect(onScaleXChange).toHaveBeenCalledWith(0.9)
})

test('renders Height and Width labels', () => {
  render(<Controls {...defaults} />)
  expect(screen.getByText('Height')).toBeInTheDocument()
  expect(screen.getByText('Width')).toBeInTheDocument()
})
