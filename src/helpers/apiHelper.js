const apiHelper = (() => {
  const getBaseUrl = () => {
    return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8081/api'
  }

  function getAccessToken() {
    return localStorage.getItem('token') || ''
  }

  function putAccessToken(token) {
    if (!token) {
      localStorage.removeItem('token')
    } else {
      localStorage.setItem('token', token)
    }
  }

  function getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  function putUser(user) {
    if (!user) {
      localStorage.removeItem('user')
    } else {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  async function fetchData(url, options = {}) {
    const token = getAccessToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const baseUrl = getBaseUrl().replace(/\/+$/, '')
    let fullUrl = url
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fullUrl = url
    } else {
      let cleanPath = url.replace(/^\/+/, '')
      if (baseUrl.endsWith('/api') && cleanPath.startsWith('api/')) {
        cleanPath = cleanPath.slice(4)
      }
      fullUrl = `${baseUrl}/${cleanPath}`
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(result.message || result.error || `Request failed with status ${response.status}`)
    }
    return result
  }

  return {
    getBaseUrl,
    getAccessToken,
    putAccessToken,
    getUser,
    putUser,
    fetchData,
  }
})()

export default apiHelper
