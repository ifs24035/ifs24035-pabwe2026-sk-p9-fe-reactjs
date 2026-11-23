import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PublicArticleList from './PublicArticleList'

const posts = [
  {
    id: 1,
    title: 'Belajar Go',
    slug: 'belajar-go',
    category: 'Teknologi',
    excerpt: 'Ringkasan Go',
    reading_time: 3,
    published_at: '2026-03-15T10:00:00Z',
    cover_image_path: 'https://example.com/cover.png',
    author: { id: 1, username: 'penulis' },
  },
  {
    id: 2,
    title: 'Tanpa Penulis',
    slug: 'tanpa-penulis',
    category: 'Umum',
    excerpt: 'Ringkasan lain',
    reading_time: 1,
    published_at: null,
  },
]

const baseProps = () => ({
  posts,
  categories: ['Teknologi', 'Umum'],
  query: '',
  category: '',
  loading: false,
  onQueryChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onOpen: vi.fn(),
  onStartWriting: vi.fn(),
})

describe('PublicArticleList Component', () => {
  it('renders hero, article cards with metadata, and handles interactions', () => {
    const props = baseProps()
    render(<PublicArticleList {...props} />)

    expect(screen.getByText('Mulai Menulis')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Mulai Menulis'))
    expect(props.onStartWriting).toHaveBeenCalled()

    // Card 1 (dengan cover & penulis)
    expect(screen.getByText('Belajar Go')).toBeInTheDocument()
    expect(screen.getByText('Ringkasan Go')).toBeInTheDocument()
    expect(screen.getByText('penulis')).toBeInTheDocument()
    expect(screen.getByText('3 menit baca')).toBeInTheDocument()
    expect(screen.getByAltText('Sampul Belajar Go')).toBeInTheDocument()

    // Card 2 (tanpa cover & tanpa penulis)
    expect(screen.getByText('Anonim')).toBeInTheDocument()
    expect(screen.queryByAltText('Sampul Tanpa Penulis')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Belajar Go'))
    expect(props.onOpen).toHaveBeenCalledWith(posts[0])
  })

  it('handles live search and category pill filters', () => {
    const props = baseProps()
    const { rerender } = render(<PublicArticleList {...props} />)

    fireEvent.change(screen.getByLabelText('Cari artikel'), { target: { value: 'react' } })
    expect(props.onQueryChange).toHaveBeenCalledWith('react')

    const pills = screen.getByTestId('category-pills')
    expect(pills).toHaveTextContent('Semua')
    fireEvent.click(screen.getByRole('button', { name: 'Teknologi' }))
    expect(props.onCategoryChange).toHaveBeenCalledWith('Teknologi')
    fireEvent.click(screen.getByRole('button', { name: 'Semua' }))
    expect(props.onCategoryChange).toHaveBeenCalledWith('')

    // Pill aktif memakai gaya berbeda (kategori terpilih)
    rerender(<PublicArticleList {...props} category="Teknologi" />)
    expect(screen.getByRole('button', { name: 'Teknologi' }).className).toContain('bg-primary-600')
    expect(screen.getByRole('button', { name: 'Semua' }).className).not.toContain('bg-primary-600')
  })

  it('renders loading and empty states', () => {
    const props = baseProps()
    const { rerender } = render(<PublicArticleList {...props} loading={true} />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()

    rerender(<PublicArticleList {...props} posts={[]} />)
    expect(screen.getByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
  })
})
