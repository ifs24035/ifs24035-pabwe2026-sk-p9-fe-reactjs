import apiHelper from '../../../helpers/apiHelper'

const adminApi = (() => {
  async function getUsers() {
    const res = await apiHelper.fetchData('/admin/users')
    return res.data
  }

  async function getPosts() {
    const res = await apiHelper.fetchData('/admin/posts')
    return res.data
  }

  async function getUserPosts(userId) {
    const res = await apiHelper.fetchData(`/admin/users/${userId}/posts`)
    return res.data
  }

  return {
    getUsers,
    getPosts,
    getUserPosts,
  }
})()

export default adminApi
