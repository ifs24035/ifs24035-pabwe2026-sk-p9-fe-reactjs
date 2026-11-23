import { describe, it, expect, beforeEach, vi } from 'vitest'
import apiHelper from './apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('manages access token and user correctly', () => {
    expect(apiHelper.getAccessToken()).toBe('')
    apiHelper.putAccessToken('token-123')
    expect(apiHelper.getAccessToken()).toBe('token-123')
    apiHelper.putAccessToken('')
    expect(apiHelper.getAccessToken()).toBe('')

    expect(apiHelper.getUser()).toBeNull()
    apiHelper.putUser({ username: 'john' })
    expect(apiHelper.getUser()).toEqual({ username: 'john' })
    apiHelper.putUser(null)
    expect(apiHelper.getUser()).toBeNull()
  })

  it('fetches data successfully with default headers and token', async () => {
    apiHelper.putAccessToken('secret-token')
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'ok' }),
    })
    global.fetch = mockFetch

    const result = await apiHelper.fetchData('/posts', { method: 'GET' })
    expect(result).toEqual({ data: 'ok' })
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8081/api/posts',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer secret-token',
        },
      })
    )
  })

  it('handles absolute or already prefixed url', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success' }),
    })
    global.fetch = mockFetch

    await apiHelper.fetchData('http://localhost:8081/api/test')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api/test', expect.any(Object))

    await apiHelper.fetchData('custom')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api/custom', expect.any(Object))

    await apiHelper.fetchData('/api/already')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8081/api/already', expect.any(Object))
  })

  it('reads VITE_API_BASE_URL from env or defaults to fallback', async () => {
    const originalViteApi = import.meta.env.VITE_API_BASE_URL

    delete import.meta.env.VITE_API_BASE_URL
    expect(apiHelper.getBaseUrl()).toBe('http://localhost:8081/api')

    import.meta.env.VITE_API_BASE_URL = 'https://api.example.com/v1'
    expect(apiHelper.getBaseUrl()).toBe('https://api.example.com/v1')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    global.fetch = mockFetch

    await apiHelper.fetchData('/posts')
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/v1/posts', expect.any(Object))

    // restore
    import.meta.env.VITE_API_BASE_URL = originalViteApi
  })

  it('throws error on non-ok responses with response error or fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    })

    await expect(apiHelper.fetchData('/bad')).rejects.toThrow('Bad request')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json')
      },
    })
    await expect(apiHelper.fetchData('/bad2')).rejects.toThrow('Request failed with status 500')
  })
})
