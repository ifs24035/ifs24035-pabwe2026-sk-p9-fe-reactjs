import { describe, it, expect, vi, beforeEach } from 'vitest'
import authApi from './authApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls login, register, logout, and getProfile successfully', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: { token: 't1', user: { id: 1 } } })
    const loginRes = await authApi.login('user', 'pass')
    expect(loginRes).toEqual({ token: 't1', user: { id: 1 } })
    expect(apiHelper.fetchData).toHaveBeenCalledWith('/auth/login', expect.objectContaining({ method: 'POST' }))

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'registered' } })
    const regRes = await authApi.register('user', 'email@delcom.org', 'pass')
    expect(regRes).toEqual({ message: 'registered' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'user', email: 'email@delcom.org', password: 'pass', role: 'member' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { message: 'registered admin' } })
    await authApi.register('adm', 'adm@delcom.org', 'pass', 'admin')
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'adm', email: 'adm@delcom.org', password: 'pass', role: 'admin' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ status: 'success' })
    expect(await authApi.logout()).toEqual({ status: 'success' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/auth/logout', { method: 'POST' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 1, username: 'user' } })
    const profRes = await authApi.getProfile()
    expect(profRes).toEqual({ id: 1, username: 'user' })
  })
})
