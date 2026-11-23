import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useInput from './useInput'

describe('useInput hook', () => {
  it('manages input state and value change event', () => {
    const { result } = renderHook(() => useInput('initial'))
    expect(result.current[0]).toBe('initial')

    act(() => {
      result.current[1]({ target: { value: 'updated' } })
    })
    expect(result.current[0]).toBe('updated')

    act(() => {
      result.current[2]('direct-set')
    })
    expect(result.current[0]).toBe('direct-set')
  })
})
