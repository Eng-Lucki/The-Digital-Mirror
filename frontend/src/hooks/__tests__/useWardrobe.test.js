import { renderHook, act } from '@testing-library/react'
import { useWardrobe } from '../useWardrobe'

const shirt = { id: '1', type: 'shirt', url: 'blob:1', name: 'shirt.png', colors: [] }
const pants = { id: '2', type: 'pants', url: 'blob:2', name: 'pants.png', colors: [] }

test('initial items array is empty', () => {
  const { result } = renderHook(() => useWardrobe())
  expect(result.current.items).toHaveLength(0)
})

test('addItem adds an item', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  expect(result.current.items).toHaveLength(1)
})

test('addItem replaces item of same type', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  act(() => result.current.addItem({ ...shirt, id: '3', url: 'blob:3' }))
  expect(result.current.items).toHaveLength(1)
  expect(result.current.items[0].id).toBe('3')
})

test('addItem keeps items of different types', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  act(() => result.current.addItem(pants))
  expect(result.current.items).toHaveLength(2)
})

test('removeItem removes by id', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  act(() => result.current.removeItem('1'))
  expect(result.current.items).toHaveLength(0)
})

test('getItemByType returns matching item', () => {
  const { result } = renderHook(() => useWardrobe())
  act(() => result.current.addItem(shirt))
  expect(result.current.getItemByType('shirt')).toEqual(shirt)
})

test('getItemByType returns null when not found', () => {
  const { result } = renderHook(() => useWardrobe())
  expect(result.current.getItemByType('shirt')).toBeNull()
})
