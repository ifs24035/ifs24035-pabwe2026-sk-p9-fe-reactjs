import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PostModal from './PostModal'

vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) => (
    <textarea data-testid="mock-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

const categories = ['Teknologi', 'Umum']

describe('PostModal Component', () => {
  it('does not render when closed', () => {
    const { container } = render(<PostModal isOpen={false} categories={categories} />)
    expect(container.firstChild).toBeNull()
  })

  it('validates empty title and does not call onSave', () => {
    const onSave = vi.fn()
    render(<PostModal isOpen={true} categories={categories} onClose={vi.fn()} onSave={onSave} />)

    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul artikel wajib diisi.')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('creates a new post with publish checkbox and closes via Batal / X', async () => {
    const onSave = vi.fn().mockResolvedValue()
    const onClose = vi.fn()
    render(<PostModal isOpen={true} categories={categories} onClose={onClose} onSave={onSave} />)

    expect(screen.getByText('Tulis Artikel Baru')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Judul Artikel'), { target: { value: '  Artikel Baru  ' } })
    fireEvent.change(screen.getByLabelText('Kategori'), { target: { value: 'Teknologi' } })
    fireEvent.change(screen.getByLabelText('Ringkasan (Excerpt)'), { target: { value: ' Ringkas ' } })
    fireEvent.change(screen.getByLabelText('URL Gambar Sampul (opsional)'), { target: { value: ' https://img/x.png ' } })
    fireEvent.change(screen.getByTestId('mock-editor'), { target: { value: '# Isi' } })
    fireEvent.click(screen.getByLabelText('Terbitkan langsung'))

    fireEvent.click(screen.getByText('Simpan Artikel'))
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        title: 'Artikel Baru',
        category: 'Teknologi',
        excerpt: 'Ringkas',
        content: '# Isi',
        cover_image_path: 'https://img/x.png',
        is_published: true,
      })
    })

    fireEvent.click(screen.getByText('Batal'))
    fireEvent.click(screen.getByLabelText('Tutup'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('edits an existing post, hides publish checkbox, and sends DELETE when cover is cleared', async () => {
    const onSave = vi.fn().mockResolvedValue()
    const post = {
      id: 3,
      title: 'Lama',
      category: 'Umum',
      excerpt: 'Ex',
      content: 'Isi lama',
      cover_image_path: 'https://img/old.png',
    }
    render(<PostModal isOpen={true} post={post} categories={categories} onClose={vi.fn()} onSave={onSave} />)

    expect(screen.getByText('Edit Artikel')).toBeInTheDocument()
    expect(screen.queryByLabelText('Terbitkan langsung')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Lama')

    fireEvent.change(screen.getByLabelText('URL Gambar Sampul (opsional)'), { target: { value: '' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        title: 'Lama',
        category: 'Umum',
        excerpt: 'Ex',
        content: 'Isi lama',
        cover_image_path: 'DELETE',
      })
    })
  })

  it('prefills fields from AI initialData as a new post', () => {
    render(
      <PostModal
        isOpen={true}
        initialData={{ title: 'Judul AI', category: 'Bisnis', excerpt: 'Ex AI', content: '## AI' }}
        categories={['Bisnis', 'Umum']}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    )
    expect(screen.getByText('Tulis Artikel Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Judul AI')
    expect(screen.getByLabelText('Kategori')).toHaveValue('Bisnis')
    expect(screen.getByTestId('mock-editor')).toHaveValue('## AI')
  })
})
