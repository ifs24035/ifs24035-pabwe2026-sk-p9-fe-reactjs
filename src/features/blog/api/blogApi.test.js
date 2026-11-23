import { describe, it, expect, vi, beforeEach } from 'vitest'
import blogApi from './blogApi'
import apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    fetchData: vi.fn(),
  },
}))

describe('blogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles public endpoints (categories, list with/without filters, detail)', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: ['Teknologi', 'Umum'] })
    expect(await blogApi.getCategories()).toEqual(['Teknologi', 'Umum'])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/categories')

    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1 }] })
    expect(await blogApi.getPublicPosts()).toEqual([{ id: 1 }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts')

    apiHelper.fetchData.mockResolvedValueOnce({ data: [] })
    await blogApi.getPublicPosts({ q: 'go lang', category: 'Teknologi' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts?q=go+lang&category=Teknologi')

    apiHelper.fetchData.mockResolvedValueOnce({ data: [] })
    await blogApi.getPublicPosts({ q: '', category: 'Bisnis' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts?category=Bisnis')

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 2, slug: 'artikel-a' } })
    expect(await blogApi.getPublicPostBySlug('artikel a')).toEqual({ id: 2, slug: 'artikel-a' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/public/posts/artikel%20a')
  })

  it('handles author endpoints (list, stats, CRUD, toggle, AI generate)', async () => {
    apiHelper.fetchData.mockResolvedValueOnce({ data: [{ id: 1 }] })
    expect(await blogApi.getMyPosts()).toEqual([{ id: 1 }])
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts')

    apiHelper.fetchData.mockResolvedValueOnce({ data: { total: 3 } })
    expect(await blogApi.getStats()).toEqual({ total: 3 })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/stats')

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 9 } })
    expect(await blogApi.createPost({ title: 'Baru' })).toEqual({ id: 9 })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Baru' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 9, title: 'Ubah' } })
    expect(await blogApi.updatePost(9, { title: 'Ubah' })).toEqual({ id: 9, title: 'Ubah' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/9', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Ubah' }),
    })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { id: 9, is_published: true } })
    expect(await blogApi.togglePublish(9)).toEqual({ id: 9, is_published: true })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/9/toggle-publish', { method: 'PATCH' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: null })
    expect(await blogApi.deletePost(9)).toBeNull()
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/9', { method: 'DELETE' })

    apiHelper.fetchData.mockResolvedValueOnce({ data: { title: 'AI', content: '# AI' } })
    expect(await blogApi.generateAiPost({ topic: 'Go' })).toEqual({ title: 'AI', content: '# AI' })
    expect(apiHelper.fetchData).toHaveBeenLastCalledWith('/posts/ai-generate', {
      method: 'POST',
      body: JSON.stringify({ topic: 'Go' }),
    })
  })
})
