import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthorDashboard from './AuthorDashboard'

const posts = [
  { id: 1, title: 'Artikel Terbit', slug: 'artikel-terbit', category: 'Teknologi', is_published: true, created_at: '2026-03-01T00:00:00Z' },
  { id: 2, title: 'Artikel Draf', slug: 'artikel-draf', category: 'Umum', is_published: false, created_at: '2026-03-02T00:00:00Z' },
]

const baseProps = () => ({
  posts,
  stats: { total: 2, total_selesai: 1, belum_selesai: 1 },
  onCreate: vi.fn(),
  onAiGenerate: vi.fn(),
  onEdit: vi.fn(),
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onOpen: vi.fn(),
})

describe('AuthorDashboard Component', () => {
  it('renders stats, rows, and header action buttons', () => {
    const props = baseProps()
    render(<AuthorDashboard {...props} />)

    expect(screen.getByText('Workspace Penulis')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('2')
    expect(screen.getByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.getByText('Artikel Draf')).toBeInTheDocument()
    expect(screen.getByText('Terbit', { selector: 'span.ml-2' })).toBeInTheDocument()
    expect(screen.getByText('Draf', { selector: 'span.ml-2' })).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tambah Artikel'))
    expect(props.onCreate).toHaveBeenCalled()
    fireEvent.click(screen.getByText('AI Generator'))
    expect(props.onAiGenerate).toHaveBeenCalled()
  })

  it('toggles publish status via switch', () => {
    const props = baseProps()
    render(<AuthorDashboard {...props} />)

    expect(screen.getByTestId('toggle-publish-1')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('toggle-publish-2')).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(screen.getByTestId('toggle-publish-2'))
    expect(props.onToggle).toHaveBeenCalledWith(posts[1])
  })

  it('opens kebab menu for published post with view, edit, delete actions', () => {
    const props = baseProps()
    render(<AuthorDashboard {...props} />)

    fireEvent.click(screen.getByTestId('kebab-1'))
    expect(screen.getByTestId('menu-1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Lihat Artikel'))
    expect(props.onOpen).toHaveBeenCalledWith(posts[0])
    expect(screen.queryByTestId('menu-1')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('kebab-1'))
    fireEvent.click(screen.getByText('Edit'))
    expect(props.onEdit).toHaveBeenCalledWith(posts[0])

    fireEvent.click(screen.getByTestId('kebab-1'))
    fireEvent.click(screen.getByText('Hapus'))
    expect(props.onDelete).toHaveBeenCalledWith(posts[0])
  })

  it('hides "Lihat Artikel" for drafts and toggles menu closed on second click', () => {
    render(<AuthorDashboard {...baseProps()} />)

    fireEvent.click(screen.getByTestId('kebab-2'))
    expect(screen.getByTestId('menu-2')).toBeInTheDocument()
    expect(screen.queryByText('Lihat Artikel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('kebab-2'))
    expect(screen.queryByTestId('menu-2')).not.toBeInTheDocument()
  })

  it('renders empty state when there are no posts', () => {
    render(<AuthorDashboard {...baseProps()} posts={[]} />)
    expect(screen.getByTestId('author-empty')).toBeInTheDocument()
  })
})
