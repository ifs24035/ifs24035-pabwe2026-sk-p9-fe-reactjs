import apiHelper from '../../../helpers/apiHelper'

const blogApi = (() => {
  // ------------------------------------------------------------- Publik
  async function getCategories() {
    const res = await apiHelper.fetchData('/public/categories')
    return res.data
  }

  async function getPublicPosts({ q = '', category = '' } = {}) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    const query = params.toString()
    const res = await apiHelper.fetchData(`/public/posts${query ? `?${query}` : ''}`)
    return res.data
  }

  async function getPublicPostBySlug(slug) {
    const res = await apiHelper.fetchData(`/public/posts/${encodeURIComponent(slug)}`)
    return res.data
  }

  // ------------------------------------------------------------- Penulis
  async function getMyPosts() {
    const res = await apiHelper.fetchData('/posts')
    return res.data
  }

  async function getStats() {
    const res = await apiHelper.fetchData('/posts/stats')
    return res.data
  }

  async function createPost(data) {
    const res = await apiHelper.fetchData('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function updatePost(id, data) {
    const res = await apiHelper.fetchData(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return res.data
  }

  async function togglePublish(id) {
    const res = await apiHelper.fetchData(`/posts/${id}/toggle-publish`, {
      method: 'PATCH',
    })
    return res.data
  }

  async function deletePost(id) {
    const res = await apiHelper.fetchData(`/posts/${id}`, {
      method: 'DELETE',
    })
    return res.data
  }

  async function generateAiPost(data) {
    const res = await apiHelper.fetchData('/posts/ai-generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  }

  return {
    getCategories,
    getPublicPosts,
    getPublicPostBySlug,
    getMyPosts,
    getStats,
    createPost,
    updatePost,
    togglePublish,
    deletePost,
    generateAiPost,
  }
})()

export default blogApi
