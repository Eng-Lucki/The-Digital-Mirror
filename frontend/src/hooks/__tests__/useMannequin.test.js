import { renderHook, act } from '@testing-library/react'
import { useMannequin } from '../useMannequin'

test('initial gender is male', () => {
  const { result } = renderHook(() => useMannequin())
  expect(result.current.gender).toBe('male')
})

test('toggleGender switches male → female', () => {
  const { result } = renderHook(() => useMannequin())
  act(() => result.current.toggleGender())
  expect(result.current.gender).toBe('female')
})

test('toggleGender switches female → male', () => {
  const { result } = renderHook(() => useMannequin())
  act(() => result.current.toggleGender())
  act(() => result.current.toggleGender())
  expect(result.current.gender).toBe('male')
})

test('initial scaleX and scaleY are 1.0', () => {
  const { result } = renderHook(() => useMannequin())
  expect(result.current.scaleY).toBe(1.0)
  expect(result.current.scaleX).toBe(1.0)
})

test('setScaleY updates scaleY', () => {
  const { result } = renderHook(() => useMannequin())
  act(() => result.current.setScaleY(1.1))
  expect(result.current.scaleY).toBe(1.1)
})
