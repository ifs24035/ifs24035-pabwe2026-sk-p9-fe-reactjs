import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthModal from './AuthModal'

describe('AuthModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('verifies explicit login form IDs and handles login submit', async () => {
    const onLogin = vi.fn().mockResolvedValue()
    const onClose = vi.fn()

    render(<AuthModal isOpen={true} onClose={onClose} onLogin={onLogin} onRegister={vi.fn()} />)

    // Verify required IDs exist
    const usernameInput = document.getElementById('login-username')
    const passwordInput = document.getElementById('login-password')
    const submitBtn = document.getElementById('login-submit')

    expect(usernameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitBtn).toBeInTheDocument()

    // Fill credentials
    fireEvent.change(usernameInput, { target: { value: 'user123' } })
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })

    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({ username: 'user123', password: 'secret123' })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('switches to register tab and submits registration', async () => {
    const onRegister = vi.fn().mockResolvedValue()
    const onClose = vi.fn()

    render(<AuthModal isOpen={true} onClose={onClose} onLogin={vi.fn()} onRegister={onRegister} />)

    // Switch tab
    fireEvent.click(screen.getByText('Daftar (Register)'))
    expect(screen.getByText('Daftar Akun Baru')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } })

    fireEvent.click(screen.getByTestId('btn-submit-auth'))

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'admin',
      })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error message on failure and clears error when switching tabs', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Kredensial tidak valid'))
    render(<AuthModal isOpen={true} onClose={vi.fn()} onLogin={onLogin} onRegister={vi.fn()} />)

    const usernameInput = document.getElementById('login-username')
    const passwordInput = document.getElementById('login-password')
    const submitBtn = document.getElementById('login-submit')

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Kredensial tidak valid')).toBeInTheDocument()
    })

    // Click register tab - clears error
    fireEvent.click(screen.getByText('Daftar (Register)'))
    expect(screen.queryByText('Kredensial tidak valid')).not.toBeInTheDocument()

    // Click login tab - stays cleared
    fireEvent.click(screen.getByText('Masuk (Login)'))
    expect(screen.queryByText('Kredensial tidak valid')).not.toBeInTheDocument()
  })

  it('shows the default error message when the error has no message', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error(''))
    render(<AuthModal isOpen={true} onClose={vi.fn()} onLogin={onLogin} onRegister={vi.fn()} />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'user' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'pass' } })
    fireEvent.click(document.getElementById('login-submit'))

    expect(await screen.findByText('Terjadi kesalahan autentikasi.')).toBeInTheDocument()
  })
})
