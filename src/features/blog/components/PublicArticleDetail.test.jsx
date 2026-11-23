import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PublicArticleDetail from './PublicArticleDetail'

vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

const post = {
  id: 1,
  title: 'Judul Artikel',
  category: 'Teknologi',
  content: '# Isi Artikel',
  reading_time: 4,
  published_at: '2026-03-15T10:00:00Z',
  cover_image_path: 'https://example.com/cover.png',
  author: { id: 1, username: 'penulis' },
}

describe('PublicArticleDetail Component', () => {
  it('renders loading state', () => {
    render(<PublicArticleDetail loading={true} post={null} onBack={vi.fn()} />)
    expect(screen.getByTestId('article-loading')).toBeInTheDocument()
  })

  it('renders not-found state with back button', () => {
    const onBack = vi.fn()
    render(<PublicArticleDetail loading={false} post={null} onBack={onBack} />)
    expect(screen.getByText('Artikel tidak ditemukan.')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(onBack).toHaveBeenCalled()
  })

  it('renders full article with metadata, cover, and markdown content', () => {
    const onBack = vi.fn()
    render(<PublicArticleDetail loading={false} post={post} onBack={onBack} />)

    expect(screen.getByText('Judul Artikel')).toBeInTheDocument()
    expect(screen.getByText('Teknologi')).toBeInTheDocument()
    expect(screen.getByText('penulis')).toBeInTheDocument()
    expect(screen.getByText('4 menit baca')).toBeInTheDocument()
    expect(screen.getByAltText('Sampul Judul Artikel')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent('# Isi Artikel')

    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(onBack).toHaveBeenCalled()
  })

  it('renders anonymous author and no cover when data is missing', () => {
    render(
      <PublicArticleDetail
        loading={false}
        post={{ ...post, author: undefined, cover_image_path: '' }}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText('Anonim')).toBeInTheDocument()
    expect(screen.queryByAltText('Sampul Judul Artikel')).not.toBeInTheDocument()
  })
})
