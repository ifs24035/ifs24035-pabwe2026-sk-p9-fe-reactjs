import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StickyNavbar from './StickyNavbar'

const accents = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
]

const baseProps = () => ({
  user: null,
  mode: 'light',
  accent: 'indigo',
  accents,
  onToggleMode: vi.fn(),
  onChangeAccent: vi.fn(),
  onNavigate: vi.fn(),
  onLogout: vi.fn(),
})

describe('StickyNavbar Component', () => {
  it('renders guest navbar with Masuk/Daftar and handles theme controls', () => {
    const props = baseProps()
    render(<StickyNavbar {...props} />)

    expect(screen.getByTestId('sticky-navbar')).toBeInTheDocument()
    expect(screen.getByText('Delcom Blog')).toBeInTheDocument()
    expect(screen.queryByText('Workspace Penulis')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
    expect(screen.queryByText('Keluar')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Beranda Delcom Blog'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/')
    fireEvent.click(screen.getByText('Beranda'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/')

    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/login')
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/register')

    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
    expect(props.onToggleMode).toHaveBeenCalled()
    fireEvent.click(screen.getByLabelText('Tema Emerald'))
    expect(props.onChangeAccent).toHaveBeenCalledWith('emerald')
  })

  it('renders dark-mode icon title for dark mode', () => {
    render(<StickyNavbar {...baseProps()} mode="dark" />)
    expect(screen.getByLabelText('Toggle Mode Gelap Terang')).toHaveAttribute('title', 'Ganti ke Mode Terang')
  })

  it('renders member navbar with workspace link and logout', () => {
    const props = baseProps()
    render(<StickyNavbar {...props} user={{ username: 'penulis', role: 'member' }} />)

    expect(screen.getByText('penulis')).toBeInTheDocument()
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Masuk' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Workspace Penulis'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/author')

    fireEvent.click(screen.getByText('Keluar'))
    expect(props.onLogout).toHaveBeenCalled()
  })

  it('renders admin link for admin users', () => {
    const props = baseProps()
    render(<StickyNavbar {...props} user={{ username: 'root', role: 'admin' }} />)

    fireEvent.click(screen.getByText('Admin Panel'))
    expect(props.onNavigate).toHaveBeenLastCalledWith('/admin')
  })
})
