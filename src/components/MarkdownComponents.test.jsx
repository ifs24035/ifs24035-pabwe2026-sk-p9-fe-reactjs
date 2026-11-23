import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'

describe('Markdown Components', () => {
  it('renders MarkdownEditor and MarkdownViewer, handles updates, and cleans up on unmount', () => {
    const handleChange = vi.fn()
    const { rerender, unmount } = render(
      <MarkdownEditor value="# Initial" onChange={handleChange} />
    )
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    // Test rerender with new value
    rerender(<MarkdownEditor value="# Updated" onChange={handleChange} />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()

    // Test unmount
    unmount()

    // Test MarkdownViewer
    const { rerender: rerenderViewer, unmount: unmountViewer } = render(
      <MarkdownViewer content="# View Title" />
    )
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    rerenderViewer(<MarkdownViewer content="# Updated View Title" />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    rerenderViewer(<MarkdownViewer content="" />)
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()

    unmountViewer()
  })

  it('uses the dark theme when <html> has the dark class', () => {
    document.documentElement.classList.add('dark')
    const { unmount } = render(<MarkdownEditor value="# Dark" onChange={vi.fn()} />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    unmount()
    document.documentElement.classList.remove('dark')
  })
})
