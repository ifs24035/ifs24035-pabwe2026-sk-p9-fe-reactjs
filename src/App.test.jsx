import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Swal from 'sweetalert2'
import App from './App'
import blogApi from './features/blog/api/blogApi'
import authApi from './features/auth/api/authApi'
import adminApi from './features/admin/api/adminApi'

vi.mock('./features/blog/api/blogApi', () => ({
  default: {
    getCategories: vi.fn(),
    getPublicPosts: vi.fn(),
    getPublicPostBySlug: vi.fn(),
    getMyPosts: vi.fn(),
    getStats: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    togglePublish: vi.fn(),
    deletePost: vi.fn(),
    generateAiPost: vi.fn(),
  },
}))

vi.mock('./features/auth/api/authApi', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
  },
}))

vi.mock('./features/admin/api/adminApi', () => ({
  default: {
    getUsers: vi.fn(),
    getPosts: vi.fn(),
    getUserPosts: vi.fn(),
  },
}))

vi.mock('./components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea data-testid="mock-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

vi.mock('./components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

const memberUser = { id: 2, username: 'member', role: 'member' }
const adminUser = { id: 1, username: 'admin', role: 'admin' }

const publicPost = {
  id: 1,
  title: 'Artikel Publik',
  slug: 'artikel-publik',
  category: 'Teknologi',
  excerpt: 'Ringkasan publik',
  content: '# Isi Publik',
  reading_time: 2,
  published_at: '2026-03-15T10:00:00Z',
  author: { id: 2, username: 'member' },
}

const myPosts = [
  { id: 1, title: 'Artikel Saya', slug: 'artikel-saya', category: 'Teknologi', excerpt: 'Ex', content: 'Isi', is_published: true, created_at: '2026-03-01T00:00:00Z' },
  { id: 2, title: 'Draf Saya', slug: 'draf-saya', category: 'Umum', excerpt: 'Ex2', content: 'Isi2', is_published: false, created_at: '2026-03-02T00:00:00Z' },
]

const aiResult = {
  title: 'Judul AI',
  category: 'Teknologi',
  excerpt: 'Ringkasan AI',
  content: '## Isi AI',
  search_sources: ['Sumber A (https://a.com)'],
}

const loginAs = (user) => {
  localStorage.setItem('token', 'jwt-token')
  localStorage.setItem('user', JSON.stringify(user))
}

const errorAlertCalled = (text) =>
  expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text }))

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')

    for (const api of [blogApi, authApi, adminApi]) {
      Object.values(api).forEach((fn) => fn.mockReset())
    }
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true })
    Swal.fire.mockClear()

    blogApi.getCategories.mockResolvedValue(['Teknologi', 'Umum'])
    blogApi.getPublicPosts.mockResolvedValue([publicPost])
    blogApi.getPublicPostBySlug.mockResolvedValue(publicPost)
    blogApi.getMyPosts.mockResolvedValue(myPosts)
    blogApi.getStats.mockResolvedValue({ total: 2, total_selesai: 1, belum_selesai: 1 })
    blogApi.createPost.mockResolvedValue({ id: 3 })
    blogApi.updatePost.mockResolvedValue({ id: 1 })
    blogApi.togglePublish.mockResolvedValue({ id: 2, is_published: true })
    blogApi.deletePost.mockResolvedValue(null)
    blogApi.generateAiPost.mockResolvedValue(aiResult)

    authApi.login.mockResolvedValue({ token: 'jwt-123', user: memberUser })
    authApi.register.mockResolvedValue({ token: 'jwt-456', user: adminUser })
    authApi.logout.mockResolvedValue({})

    adminApi.getUsers.mockResolvedValue([
      { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 0, total_published: 0 },
      { id: 2, username: 'member', email: 'member@delcom.org', role: 'member', total_posts: 2, total_published: 1 },
    ])
    adminApi.getPosts.mockResolvedValue([])
    adminApi.getUserPosts.mockResolvedValue([])
  })

  afterEach(async () => {
    // Tuntaskan state update async yang tertunda agar tidak memicu peringatan act(...)
    await act(async () => {})
  })

  // ------------------------------------------------------------------ Publik

  it('renders public list for guests, supports search/filter, detail navigation, theme and auth pages', async () => {
    render(<App />)

    expect(await screen.findByText('Artikel Publik')).toBeInTheDocument()
    expect(screen.queryByTestId('author-dashboard')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()

    // Live search & filter kategori
    fireEvent.change(screen.getByLabelText('Cari artikel'), { target: { value: 'go' } })
    await waitFor(() => expect(blogApi.getPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: '' }))
    fireEvent.click(screen.getByRole('button', { name: 'Teknologi' }))
    await waitFor(() => expect(blogApi.getPublicPosts).toHaveBeenLastCalledWith({ q: 'go', category: 'Teknologi' }))

    // Detail artikel via slug
    fireEvent.click(screen.getByText('Artikel Publik'))
    expect(await screen.findByTestId('public-article-detail')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/artikel-publik')
    expect(blogApi.getPublicPostBySlug).toHaveBeenCalledWith('artikel-publik')
    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent('# Isi Publik')

    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()

    // Tema
    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    fireEvent.click(screen.getByLabelText('Tema Emerald'))
    expect(document.documentElement.getAttribute('data-accent')).toBe('emerald')
    fireEvent.click(screen.getByLabelText('Toggle Mode Gelap Terang'))

    // Navigasi ke halaman auth dan kembali
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(screen.getByText('Masuk ke Delcom Blog')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Kembali ke Halaman Utama/))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByText('Daftar Akun Penulis')).toBeInTheDocument()

    // Tombol back/forward browser
    window.history.pushState({}, '', '/')
    fireEvent(window, new PopStateEvent('popstate'))
    expect(await screen.findByTestId('public-article-list')).toBeInTheDocument()
  })

  it('shows not-found state for unknown article slug', async () => {
    blogApi.getPublicPostBySlug.mockRejectedValue(new Error('Post not found'))
    window.history.pushState({}, '', '/posts/artikel%20hilang')
    render(<App />)

    expect(await screen.findByText('Artikel tidak ditemukan.')).toBeInTheDocument()
    expect(blogApi.getPublicPostBySlug).toHaveBeenCalledWith('artikel hilang')
  })

  it('handles public API failures gracefully', async () => {
    blogApi.getCategories.mockRejectedValue(new Error('Kategori gagal'))
    blogApi.getPublicPosts.mockRejectedValue(new Error('Daftar gagal'))
    render(<App />)

    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
    await waitFor(() => errorAlertCalled('Kategori gagal'))
  })

  it('opens auth modal from "Mulai Menulis" for guests and logs in', async () => {
    render(<App />)
    await screen.findByText('Artikel Publik')

    fireEvent.click(screen.getByText('Mulai Menulis'))
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'member' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'member' } })
    fireEvent.click(document.getElementById('login-submit'))

    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()
    expect(authApi.login).toHaveBeenCalledWith('member', 'member')
    expect(localStorage.getItem('token')).toBe('jwt-123')
    expect(await screen.findByText('Selamat datang, member!')).toBeInTheDocument()
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
  })

  it('registers via auth modal tab (register mode) with role', async () => {
    render(<App />)
    await screen.findByText('Artikel Publik')

    fireEvent.click(screen.getByText('Mulai Menulis'))
    fireEvent.click(screen.getByText('Daftar (Register)'))
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'adm' } })
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'adm@delcom.org' } })
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } })
    fireEvent.click(screen.getByTestId('btn-submit-auth'))

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
    expect(authApi.register).toHaveBeenCalledWith('adm', 'adm@delcom.org', 'password123', 'admin')
  })

  it('navigates logged-in user to workspace from "Mulai Menulis"', async () => {
    loginAs(memberUser)
    render(<App />)
    await screen.findByText('Artikel Publik')

    fireEvent.click(screen.getByText('Mulai Menulis'))
    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
  })

  // ------------------------------------------------------------------ Autentikasi

  it('logs in via /login page and logs out even when the logout request fails', async () => {
    authApi.logout.mockRejectedValue(new Error('server down'))
    window.history.pushState({}, '', '/login')
    render(<App />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'member' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'member' } })
    fireEvent.click(document.getElementById('login-submit'))

    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('2')
    expect(window.location.pathname).toBe('/author')

    fireEvent.click(screen.getByText('Keluar'))
    expect(await screen.findByRole('button', { name: 'Masuk' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(await screen.findByText('Anda telah keluar.')).toBeInTheDocument()
  })

  it('registers via /register page and lands on admin panel for admin role', async () => {
    window.history.pushState({}, '', '/register')
    render(<App />)

    fireEvent.change(document.getElementById('register-username'), { target: { value: 'adm' } })
    fireEvent.change(document.getElementById('register-email'), { target: { value: 'adm@delcom.org' } })
    fireEvent.change(document.getElementById('register-password'), { target: { value: 'password123' } })
    fireEvent.change(document.getElementById('register-role'), { target: { value: 'admin' } })
    fireEvent.click(document.getElementById('register-submit'))

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/admin')
  })

  // ------------------------------------------------------------------ Guard rute

  it('guards /author and /admin routes', async () => {
    window.history.pushState({}, '', '/author')
    const { unmount } = render(<App />)
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
    unmount()

    window.history.pushState({}, '', '/admin')
    const second = render(<App />)
    expect(screen.getByTestId('auth-page')).toBeInTheDocument()
    second.unmount()

    loginAs(memberUser)
    window.history.pushState({}, '', '/admin')
    render(<App />)
    expect(screen.getByTestId('forbidden')).toBeInTheDocument()
    expect(adminApi.getUsers).not.toHaveBeenCalled()
  })

  // ------------------------------------------------------------------ Workspace penulis

  it('creates a post, validates, and closes modal', async () => {
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByText('Tambah Artikel'))
    expect(screen.getByText('Tulis Artikel Baru')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Batal'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Tambah Artikel'))
    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul artikel wajib diisi.')

    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Judul Baru' } })
    fireEvent.change(screen.getByTestId('mock-editor'), { target: { value: 'Isi baru' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))

    await waitFor(() =>
      expect(blogApi.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Judul Baru', content: 'Isi baru', is_published: false })
      )
    )
    expect(await screen.findByText('Artikel berhasil dibuat.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument())
    expect(blogApi.getMyPosts).toHaveBeenCalledTimes(2)
  })

  it('edits an existing post from kebab menu', async () => {
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByTestId('kebab-1'))
    fireEvent.click(screen.getByText('Edit'))
    expect(screen.getByText('Edit Artikel')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'Judul Diubah' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))

    await waitFor(() =>
      expect(blogApi.updatePost).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Judul Diubah' }))
    )
    expect(await screen.findByText('Artikel berhasil diperbarui.')).toBeInTheDocument()
  })

  it('shows an error alert when saving fails', async () => {
    blogApi.createPost.mockRejectedValue(new Error('gagal simpan'))
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByText('Tambah Artikel'))
    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))

    await waitFor(() => errorAlertCalled('gagal simpan'))
    expect(screen.getByTestId('post-modal')).toBeInTheDocument()
  })

  it('toggles publication status with proper feedback and handles errors', async () => {
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByTestId('toggle-publish-2'))
    await waitFor(() => expect(blogApi.togglePublish).toHaveBeenCalledWith(2))
    expect(await screen.findByText('Artikel berhasil diterbitkan.')).toBeInTheDocument()

    blogApi.togglePublish.mockResolvedValueOnce({ id: 1, is_published: false })
    fireEvent.click(screen.getByTestId('toggle-publish-1'))
    expect(await screen.findByText('Artikel dikembalikan ke draf.')).toBeInTheDocument()

    blogApi.togglePublish.mockRejectedValueOnce(new Error('gagal toggle'))
    fireEvent.click(screen.getByTestId('toggle-publish-1'))
    await waitFor(() => errorAlertCalled('gagal toggle'))
  })

  it('deletes a post only after confirmation and handles errors', async () => {
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    // Dibatalkan
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    fireEvent.click(screen.getByTestId('kebab-2'))
    fireEvent.click(screen.getByText('Hapus'))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled())
    expect(blogApi.deletePost).not.toHaveBeenCalled()

    // Dikonfirmasi
    fireEvent.click(screen.getByTestId('kebab-2'))
    fireEvent.click(screen.getByText('Hapus'))
    await waitFor(() => expect(blogApi.deletePost).toHaveBeenCalledWith(2))
    expect(await screen.findByText('Artikel berhasil dihapus.')).toBeInTheDocument()

    // Gagal
    blogApi.deletePost.mockRejectedValueOnce(new Error('gagal hapus'))
    fireEvent.click(screen.getByTestId('kebab-1'))
    fireEvent.click(screen.getByText('Hapus'))
    await waitFor(() => errorAlertCalled('gagal hapus'))
  })

  it('opens a published article from the kebab menu', async () => {
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByTestId('kebab-1'))
    fireEvent.click(screen.getByText('Lihat Artikel'))
    expect(await screen.findByTestId('public-article-detail')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/artikel-saya')
  })

  it('shows an error alert when author data fails to load', async () => {
    blogApi.getMyPosts.mockRejectedValue(new Error('data gagal'))
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)

    await waitFor(() => errorAlertCalled('data gagal'))
  })

  // ------------------------------------------------------------------ AI Generator

  it('generates an article with AI, applies it to the editor and saves', async () => {
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByText('AI Generator'))
    expect(screen.getByTestId('ai-post-modal')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Topik Artikel'), { target: { value: 'Tren Web' } })
    fireEvent.click(screen.getByText('Hasilkan Artikel via AI'))

    expect(await screen.findByTestId('ai-result')).toBeInTheDocument()
    expect(blogApi.generateAiPost).toHaveBeenCalledWith({ topic: 'Tren Web', category: '', include_web_search: true })
    expect(screen.getByTestId('ai-search-sources')).toHaveTextContent('Sumber A (https://a.com)')

    fireEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(screen.queryByTestId('ai-post-modal')).not.toBeInTheDocument()
    expect(screen.getByText('Tulis Artikel Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Judul AI')
    expect(screen.getByTestId('mock-editor')).toHaveValue('## Isi AI')

    fireEvent.click(screen.getByText('Simpan Artikel'))
    await waitFor(() =>
      expect(blogApi.createPost).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Judul AI', category: 'Teknologi', excerpt: 'Ringkasan AI' })
      )
    )
  })

  it('handles AI generation failure and closing the AI modal', async () => {
    blogApi.generateAiPost.mockRejectedValue(new Error('AI down'))
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByText('AI Generator'))
    fireEvent.change(screen.getByLabelText('Topik Artikel'), { target: { value: 'Topik' } })
    fireEvent.click(screen.getByText('Hasilkan Artikel via AI'))

    await waitFor(() => errorAlertCalled('AI down'))
    expect(screen.queryByTestId('ai-result')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Batal'))
    expect(screen.queryByTestId('ai-post-modal')).not.toBeInTheDocument()
  })

  // ------------------------------------------------------------------ Admin

  it('renders admin dashboard, navigates via navbar and views user posts', async () => {
    adminApi.getUserPosts.mockResolvedValue([myPosts[0]])
    loginAs(adminUser)
    window.history.pushState({}, '', '/admin')
    render(<App />)

    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('admin-user-2')).toBeInTheDocument())

    fireEvent.click(screen.getAllByText('Lihat Artikel')[1])
    expect(await screen.findByTestId('admin-user-posts-modal')).toBeInTheDocument()
    expect(adminApi.getUserPosts).toHaveBeenCalledWith(2)
    expect(screen.getByTestId('admin-user-post-1')).toBeInTheDocument()

    // Navigasi navbar
    fireEvent.click(screen.getByText('Workspace Penulis'))
    expect(await screen.findByTestId('author-dashboard')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Admin Panel'))
    expect(await screen.findByTestId('admin-dashboard')).toBeInTheDocument()
  })

  it('handles admin API failures', async () => {
    adminApi.getUsers.mockRejectedValue(new Error('admin gagal'))
    loginAs(adminUser)
    window.history.pushState({}, '', '/admin')
    render(<App />)
    await waitFor(() => errorAlertCalled('admin gagal'))
  })

  it('shows an alert and empty list when loading user posts fails', async () => {
    adminApi.getUserPosts.mockRejectedValue(new Error('posts user gagal'))
    loginAs(adminUser)
    window.history.pushState({}, '', '/admin')
    render(<App />)

    await waitFor(() => expect(screen.getByTestId('admin-user-2')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Lihat Artikel')[0])

    await waitFor(() => errorAlertCalled('posts user gagal'))
    expect(await screen.findByText('Pengguna ini belum memiliki artikel.')).toBeInTheDocument()
  })

  it('logs out successfully when the logout request succeeds', async () => {
    loginAs(memberUser)
    window.history.pushState({}, '', '/author')
    render(<App />)
    await screen.findByTestId('author-dashboard')

    fireEvent.click(screen.getByText('Keluar'))
    expect(await screen.findByRole('button', { name: 'Masuk' })).toBeInTheDocument()
    expect(authApi.logout).toHaveBeenCalled()
    expect(localStorage.getItem('token')).toBeNull()
  })
})