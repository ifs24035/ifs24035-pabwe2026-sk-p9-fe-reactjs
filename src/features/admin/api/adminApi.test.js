import { describe, it, expect, vi, beforeEach } from 'vitest'
import adminApi from './adminApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches users, all posts, and posts of a user', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1, username: 'admin' }] })
    expect(await adminApi.getUsers()).toEqual([{ id: 1, username: 'admin' }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/admin/users')

    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 5, title: 'Artikel' }] })
    expect(await adminApi.getPosts()).toEqual([{ id: 5, title: 'Artikel' }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/admin/posts')

    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 10, title: 'Milik User' }] })
    expect(await adminApi.getUserPosts(2)).toEqual([{ id: 10, title: 'Milik User' }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/admin/users/2/posts')
  })
})
