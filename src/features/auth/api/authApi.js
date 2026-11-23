import apiHelper from '../../../helpers/apiHelper'

const authApi = (() => {
  async function login(username, password) {
    const res = await apiHelper.fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    return res.data
  }

  async function register(username, email, password, role = 'member') {
    const res = await apiHelper.fetchData('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    })
    return res.data
  }

  async function logout() {
    const res = await apiHelper.fetchData('/auth/logout', { method: 'POST' })
    return res
  }

  async function getProfile() {
    const res = await apiHelper.fetchData('/auth/profile')
    return res.data
  }

  return {
    login,
    register,
    logout,
    getProfile,
  }
})()

export default authApi
