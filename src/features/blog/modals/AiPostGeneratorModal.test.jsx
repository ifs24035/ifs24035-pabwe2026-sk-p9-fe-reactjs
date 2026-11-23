import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AiPostGeneratorModal from './AiPostGeneratorModal'

vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}))

const categories = ['Teknologi', 'Umum']

const aiResult = {
  title: 'Judul AI',
  category: 'Teknologi',
  excerpt: 'Ringkasan AI',
  content: '## Isi AI',
  search_sources: ['Sumber 1 (https://a.com)', 'Sumber 2 (https://b.com)'],
}

const renderModal = (overrides = {}) => {
  const props = {
    isOpen: true,
    categories,
    loading: false,
    onClose: vi.fn(),
    onGenerate: vi.fn().mockResolvedValue(aiResult),
    onApply: vi.fn(),
    ...overrides,
  }
  render(<AiPostGeneratorModal {...props} />)
  return props
}

describe('AiPostGeneratorModal Component', () => {
  it('does not render when closed', () => {
    const { container } = render(<AiPostGeneratorModal isOpen={false} categories={categories} />)
    expect(container.firstChild).toBeNull()
  })

  it('does not call onGenerate for empty topic and keeps apply disabled', () => {
    const props = renderModal()
    fireEvent.click(screen.getByText('Hasilkan Artikel via AI'))
    expect(props.onGenerate).not.toHaveBeenCalled()
    expect(screen.getByText('Terapkan ke Editor')).toBeDisabled()
  })

  it('generates with web search, shows preview + sources, and applies result', async () => {
    const props = renderModal()

    fireEvent.change(screen.getByLabelText('Topik Artikel'), { target: { value: '  Tren Web  ' } })
    fireEvent.change(screen.getByLabelText('Kategori'), { target: { value: 'Teknologi' } })
    fireEvent.click(screen.getByText('Hasilkan Artikel via AI'))

    await waitFor(() => {
      expect(props.onGenerate).toHaveBeenCalledWith({
        topic: 'Tren Web',
        category: 'Teknologi',
        include_web_search: true,
      })
      expect(screen.getByTestId('ai-result')).toBeInTheDocument()
    })

    expect(screen.getByText('Judul AI')).toBeInTheDocument()
    expect(screen.getByText('Ringkasan AI')).toBeInTheDocument()
    expect(screen.getByTestId('ai-search-sources')).toHaveTextContent('Sumber 1 (https://a.com)')
    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent('## Isi AI')

    fireEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(props.onApply).toHaveBeenCalledWith(aiResult)
  })

  it('can disable web search and hides sources when none are returned', async () => {
    const props = renderModal({
      onGenerate: vi.fn().mockResolvedValue({ ...aiResult, search_sources: undefined }),
    })

    fireEvent.click(screen.getByTestId('ai-toggle-search'))
    fireEvent.change(screen.getByLabelText('Topik Artikel'), { target: { value: 'Topik' } })
    fireEvent.click(screen.getByText('Hasilkan Artikel via AI'))

    await waitFor(() => {
      expect(props.onGenerate).toHaveBeenCalledWith({ topic: 'Topik', category: '', include_web_search: false })
      expect(screen.getByTestId('ai-result')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('ai-search-sources')).not.toBeInTheDocument()
  })

  it('keeps showing no result when generation fails (null) and shows loading label', async () => {
    const props = renderModal({ onGenerate: vi.fn().mockResolvedValue(null) })

    fireEvent.change(screen.getByLabelText('Topik Artikel'), { target: { value: 'Topik' } })
    fireEvent.click(screen.getByText('Hasilkan Artikel via AI'))

    await waitFor(() => expect(props.onGenerate).toHaveBeenCalled())
    expect(screen.queryByTestId('ai-result')).not.toBeInTheDocument()
  })

  it('shows loading label and closes via X and Batal', () => {
    const props = renderModal({ loading: true })
    expect(screen.getByText('AI sedang menulis...')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Tutup'))
    fireEvent.click(screen.getByText('Batal'))
    expect(props.onClose).toHaveBeenCalledTimes(2)
  })
})
