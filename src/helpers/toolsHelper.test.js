import { describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import {
  formatDate,
  showErrorAlert,
  showSuccessAlert,
  showConfirmDialog,
} from './toolsHelper'

describe('toolsHelper', () => {
  it('formats dates properly and handles invalid dates', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('invalid-date')).toBe('-')
    const formatted = formatDate('2026-03-15')
    expect(formatted).toContain('2026')
  })

  it('triggers Swal.fire for alerts and confirm dialog', async () => {
    const swalSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true })

    showErrorAlert('Error happened')
    expect(swalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        text: 'Error happened',
      })
    )

    showSuccessAlert('Success happened')
    expect(swalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'success',
        text: 'Success happened',
      })
    )

    const confirmed = await showConfirmDialog('Are you sure?')
    expect(swalSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'warning',
        text: 'Are you sure?',
      })
    )
    expect(confirmed).toBe(true)

    swalSpy.mockRestore()
  })
})
