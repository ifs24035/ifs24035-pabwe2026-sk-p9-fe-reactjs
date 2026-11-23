import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PostStats from './PostStats'

describe('PostStats Component', () => {
  it('renders default zeroes when no stats passed', () => {
    render(<PostStats />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-terbit')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-draf')).toHaveTextContent('0')
  })

  it('renders passed stats correctly', () => {
    render(<PostStats stats={{ total: 10, total_selesai: 6, belum_selesai: 4 }} />)
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('Total Terbit')).toBeInTheDocument()
    expect(screen.getByText('Belum Selesai')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('10')
    expect(screen.getByTestId('stat-terbit')).toHaveTextContent('6')
    expect(screen.getByTestId('stat-draf')).toHaveTextContent('4')
  })
})
