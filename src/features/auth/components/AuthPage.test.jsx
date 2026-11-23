import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthPage from './AuthPage'

describe('AuthPage Component', () => {
  it('renders login mode and handles successful login', async () => {
    const handleLogin = vi.fn().mockResolvedValue({})
    const handleNavigate = vi.fn()

    render(
      <AuthPage
        mode="login"
        onLogin={handleLogin}
        onRegister={vi.fn()}
        onNavigate={handleNavigate}
      />
    )

    expect(screen.getByText('Masuk ke Delcom Blog')).toBeInTheDocument()

    fireEvent.change(document.getElementById('login-username'), {
      target: { value: 'johndoe' },
    })
    fireEvent.change(document.getElementById('login-password'), {
      target: { value: 'secret123' },
    })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith({
        username: 'johndoe',
        password: 'secret123',
      })
    })
    expect(handleNavigate).not.toHaveBeenCalled()

    // Switch to register
    fireEvent.click(screen.getByText('Daftar di sini'))
    expect(handleNavigate).toHaveBeenCalledWith('/register')

    // Back to home
    fireEvent.click(screen.getByText('← Kembali ke Halaman Utama'))
    expect(handleNavigate).toHaveBeenCalledWith('/')
  })

  it('renders register mode and handles successful registration and role select', async () => {
    const handleRegister = vi.fn().mockResolvedValue({})
    const handleNavigate = vi.fn()

    render(
      <AuthPage
        mode="register"
        onLogin={vi.fn()}
        onRegister={handleRegister}
        onNavigate={handleNavigate}
      />
    )

    expect(screen.getByText('Daftar Akun Penulis')).toBeInTheDocument()

    fireEvent.change(document.getElementById('register-username'), {
      target: { value: 'janedoe' },
    })
    fireEvent.change(document.getElementById('register-email'), {
      target: { value: 'jane@example.com' },
    })
    fireEvent.change(document.getElementById('register-password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(document.getElementById('register-role'), {
      target: { value: 'admin' },
    })
    fireEvent.click(document.getElementById('register-submit'))

    await waitFor(() => {
      expect(handleRegister).toHaveBeenCalledWith({
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'admin',
      })
    })

    // Switch to login
    fireEvent.click(screen.getByText('Masuk di sini'))
    expect(handleNavigate).toHaveBeenCalledWith('/login')
  })

  it('handles login error gracefully', async () => {
    const handleLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    const handleNavigate = vi.fn()

    render(
      <AuthPage
        mode="login"
        onLogin={handleLogin}
        onRegister={vi.fn()}
        onNavigate={handleNavigate}
      />
    )

    fireEvent.change(document.getElementById('login-username'), {
      target: { value: 'johndoe' },
    })
    fireEvent.change(document.getElementById('login-password'), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('auth-error-msg')).toHaveTextContent('Invalid credentials')
    })
  })

  it('handles fallback error message when error has no message', async () => {
    const handleLogin = vi.fn().mockRejectedValue({})
    const handleNavigate = vi.fn()

    render(
      <AuthPage
        mode="login"
        onLogin={handleLogin}
        onRegister={vi.fn()}
        onNavigate={handleNavigate}
      />
    )

    fireEvent.change(document.getElementById('login-username'), {
      target: { value: 'user1' },
    })
    fireEvent.change(document.getElementById('login-password'), {
      target: { value: 'pass1' },
    })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('auth-error-msg')).toHaveTextContent('Terjadi kesalahan autentikasi.')
    })
  })
})
