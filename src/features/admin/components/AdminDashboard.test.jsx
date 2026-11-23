import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'

const users = [
  { id: 1, username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 0, total_published: 0 },
  { id: 2, username: 'member', email: 'member@delcom.org', role: 'member', total_posts: 6, total_published: 5 },
]

const posts = [
  { id: 10, title: 'Artikel Terbit', category: 'Teknologi', is_published: true, created_at: '2026-03-01T00:00:00Z', author: { username: 'member' } },
  { id: 11, title: 'Artikel Draf', category: 'Umum', is_published: false, created_at: '2026-03-02T00:00:00Z' },
]

describe('AdminDashboard Component', () => {
  it('renders summary cards and users table with per-user statistics', () => {
    render(<AdminDashboard users={users} posts={posts} onLoadUserPosts={vi.fn()} />)

    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    expect(screen.getByTestId('admin-total-users')).toHaveTextContent('2')
    expect(screen.getByTestId('admin-total-posts')).toHaveTextContent('6')
    expect(screen.getByTestId('admin-total-published')).toHaveTextContent('5')

    const row = screen.getByTestId('admin-user-2')
    expect(row).toHaveTextContent('member@delcom.org')
    expect(row).toHaveTextContent('6')
    expect(row).toHaveTextContent('5')
  })

  it('switches to all-posts tab and renders status badges and author fallback', () => {
    render(<AdminDashboard users={users} posts={posts} onLoadUserPosts={vi.fn()} />)

    fireEvent.click(screen.getByText('Semua Artikel'))
    expect(screen.getByTestId('admin-posts-table')).toBeInTheDocument()
    expect(screen.getByTestId('admin-post-10')).toHaveTextContent('member')
    expect(screen.getByTestId('admin-post-10')).toHaveTextContent('Terbit')
    expect(screen.getByTestId('admin-post-11')).toHaveTextContent('Draf')
    expect(screen.getByTestId('admin-post-11')).toHaveTextContent('-')

    fireEvent.click(screen.getByText('Pengguna'))
    expect(screen.getByTestId('admin-users-table')).toBeInTheDocument()
  })

  it('loads and shows articles of a selected user, then closes the modal', async () => {
    const onLoadUserPosts = vi.fn().mockResolvedValue([posts[0], posts[1]])
    render(<AdminDashboard users={users} posts={posts} onLoadUserPosts={onLoadUserPosts} />)

    fireEvent.click(screen.getAllByText('Lihat Artikel')[1])
    await waitFor(() => {
      expect(screen.getByTestId('admin-user-posts-modal')).toBeInTheDocument()
    })
    expect(onLoadUserPosts).toHaveBeenCalledWith(2)
    expect(screen.getByText('Artikel milik member')).toBeInTheDocument()
    expect(screen.getByTestId('admin-user-post-10')).toHaveTextContent('Artikel Terbit')
    expect(screen.getByTestId('admin-user-post-11')).toHaveTextContent('Draf')

    fireEvent.click(screen.getByLabelText('Tutup'))
    expect(screen.queryByTestId('admin-user-posts-modal')).not.toBeInTheDocument()
  })

  it('shows empty message when a user has no articles', async () => {
    render(<AdminDashboard users={users} posts={posts} onLoadUserPosts={vi.fn().mockResolvedValue([])} />)

    fireEvent.click(screen.getAllByText('Lihat Artikel')[0])
    await waitFor(() => {
      expect(screen.getByText('Pengguna ini belum memiliki artikel.')).toBeInTheDocument()
    })
  })
})
