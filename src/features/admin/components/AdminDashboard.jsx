import React, { useState } from 'react'
import { IconUsers, IconArticle, IconCircleCheck, IconX } from '@tabler/icons-react'
import { formatDate } from '../../../helpers/toolsHelper'

export default function AdminDashboard({ users, posts, onLoadUserPosts }) {
  const [tab, setTab] = useState('users')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])

  const totalPosts = users.reduce((sum, u) => sum + u.total_posts, 0)
  const totalPublished = users.reduce((sum, u) => sum + u.total_published, 0)

  const handleViewPosts = async (user) => {
    const data = await onLoadUserPosts(user.id)
    setUserPosts(data)
    setSelectedUser(user)
  }

  const tabClass = (active) =>
    `px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
      active
        ? 'bg-primary-600 text-white shadow-xs'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`

  const statusBadge = (published) => (
    <span
      className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
        published
          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
      }`}
    >
      {published ? 'Terbit' : 'Draf'}
    </span>
  )

  return (
    <div className="w-full space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Admin Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monitoring seluruh pengguna dan arsip artikel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <IconUsers size={22} className="text-blue-600" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Pengguna</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100" data-testid="admin-total-users">
              {users.length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <IconArticle size={22} className="text-violet-600" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Artikel</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100" data-testid="admin-total-posts">
              {totalPosts}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <IconCircleCheck size={22} className="text-emerald-700" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Terbit</p>
            <p className="text-2xl font-black text-emerald-700" data-testid="admin-total-published">
              {totalPublished}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setTab('users')} className={tabClass(tab === 'users')}>
          Pengguna
        </button>
        <button type="button" onClick={() => setTab('posts')} className={tabClass(tab === 'posts')}>
          Semua Artikel
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-x-auto">
        {tab === 'users' ? (
          <table className="w-full text-sm text-left" data-testid="admin-users-table">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Username</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Total Artikel</th>
                <th className="px-5 py-3">Total Terbit</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {users.map((user) => (
                <tr key={user.id} data-testid={`admin-user-${user.id}`}>
                  <td className="px-5 py-3">{user.id}</td>
                  <td className="px-5 py-3 font-semibold">{user.username}</td>
                  <td className="px-5 py-3">{user.email}</td>
                  <td className="px-5 py-3">{user.role}</td>
                  <td className="px-5 py-3">{user.total_posts}</td>
                  <td className="px-5 py-3">{user.total_published}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleViewPosts(user)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 cursor-pointer"
                    >
                      Lihat Artikel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm text-left" data-testid="admin-posts-table">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Judul</th>
                <th className="px-5 py-3">Penulis</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {posts.map((post) => (
                <tr key={post.id} data-testid={`admin-post-${post.id}`}>
                  <td className="px-5 py-3 font-semibold">{post.title}</td>
                  <td className="px-5 py-3">{post.author ? post.author.username : '-'}</td>
                  <td className="px-5 py-3">{post.category}</td>
                  <td className="px-5 py-3">{statusBadge(post.is_published)}</td>
                  <td className="px-5 py-3">{formatDate(post.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          data-testid="admin-user-posts-modal"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold">Artikel milik {selectedUser.username}</h3>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-2">
              {userPosts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                  Pengguna ini belum memiliki artikel.
                </p>
              ) : (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800"
                    data-testid={`admin-user-post-${post.id}`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{post.title}</p>
                      <p className="text-xs text-slate-500">{post.category}</p>
                    </div>
                    {statusBadge(post.is_published)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
