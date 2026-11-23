import { useState, useEffect } from 'react'

export const ACCENTS = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'violet', name: 'Violet', hex: '#8b5cf6' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b' },
]

export function useTheme() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme-mode') || 'light'
  })
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('theme-accent') || 'indigo'
  })

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  useEffect(() => {
    localStorage.setItem('theme-accent', accent)
    document.documentElement.setAttribute('data-accent', accent)
  }, [accent])

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const changeAccent = (newAccent) => {
    setAccent(newAccent)
  }

  return {
    mode,
    accent,
    toggleMode,
    changeAccent,
    setAccent: changeAccent,
    accents: ACCENTS,
  }
}

export default useTheme
