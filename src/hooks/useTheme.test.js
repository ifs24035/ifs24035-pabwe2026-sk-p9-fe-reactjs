import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import useTheme, { ACCENTS } from './useTheme'

describe('useTheme hook', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-accent')
  })

  it('initializes with default light mode and indigo accent', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.mode).toBe('light')
    expect(result.current.accent).toBe('indigo')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.getAttribute('data-accent')).toBe('indigo')
    expect(result.current.accents).toEqual(ACCENTS)
  })

  it('toggles mode between light and dark', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleMode()
    })
    expect(result.current.mode).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme-mode')).toBe('dark')

    act(() => {
      result.current.toggleMode()
    })
    expect(result.current.mode).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme-mode')).toBe('light')
  })

  it('changes accent color theme', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.changeAccent('emerald')
    })
    expect(result.current.accent).toBe('emerald')
    expect(document.documentElement.getAttribute('data-accent')).toBe('emerald')
    expect(localStorage.getItem('theme-accent')).toBe('emerald')
  })

  it('restores previous mode and accent from localStorage', () => {
    localStorage.setItem('theme-mode', 'dark')
    localStorage.setItem('theme-accent', 'rose')

    const { result } = renderHook(() => useTheme())
    expect(result.current.mode).toBe('dark')
    expect(result.current.accent).toBe('rose')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-accent')).toBe('rose')
  })
})
