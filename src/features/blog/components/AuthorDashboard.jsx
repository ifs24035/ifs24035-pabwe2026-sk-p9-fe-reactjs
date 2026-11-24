import React, { useState } from 'react'
import { IconPlus, IconSparkles, IconDotsVertical, IconEdit, IconTrash, IconEye } from '@tabler/icons-react'
import PostStats from './PostStats'
import { formatDate } from '../../../helpers/toolsHelper'

export default function AuthorDashboard({ posts, stats, onCreate, onAiGenerate, onEdit, onToggle, onDelete, onOpen }) {
  const [openMenuId, setOpenMenuId] = useState(null)

  const closeAnd = (fn) => () => {
    setOpenMenuId(null)
    fn()
  }

  return (
    <div className="w-full space-y-6" data-testid="author-dashboard">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Workspace Penulis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kelola artikel, terbitkan, atau simpan sebagai draf.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAiGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow-sm hover:opacity-90 transition cursor-pointer"
          >
            <IconSparkles size={16} />
            <span>AI Generator</span>
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-700 transition cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Tambah Artikel</span>
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-visible">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400" data-testid="author-empty">
            <p className="text-base font-medium">Belum ada artikel.</p>
            <p className="text-sm mt-1">Klik &quot;Tambah Artikel&quot; atau gunakan AI Generator untuk memulai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Judul</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Terbit</th>
                  <th className="px-5 py-3">Dibuat</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {posts.map((post) => (
                  <tr key={post.id} data-testid={`post-row-${post.id}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{post.title}</p>
                      <p className="text-xs text-slate-500">/{post.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{post.category}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={post.is_published}
                        aria-label={`Terbitkan ${post.title}`}
                        data-testid={`toggle-publish-${post.id}`}
                        onClick={() => onToggle(post)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                          post.is_published ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                            post.is_published ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        {post.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(post.created_at)}</td>
                    <td className="px-5 py-3.5 text-right relative">
                      <button
                        type="button"
                        aria-label={`Menu ${post.title}`}
                        data-testid={`kebab-${post.id}`}
                        onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <IconDotsVertical size={18} />
                      </button>
                      {openMenuId === post.id && (
                        <div
                          className="absolute right-5 top-12 z-20 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1 text-left"
                          data-testid={`menu-${post.id}`}
                        >
                          {post.is_published && (
                            <button
                              type="button"
                              onClick={closeAnd(() => onOpen(post))}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <IconEye size={16} />
                              <span>Lihat Artikel</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={closeAnd(() => onEdit(post))}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <IconEdit size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={closeAnd(() => onDelete(post))}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <IconTrash size={16} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
