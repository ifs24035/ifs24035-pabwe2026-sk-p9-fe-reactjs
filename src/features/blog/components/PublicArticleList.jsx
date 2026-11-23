import React from 'react'
import { IconSearch, IconClock, IconUser, IconPencil } from '@tabler/icons-react'
import { formatDate } from '../../../helpers/toolsHelper'

export default function PublicArticleList({
  posts,
  categories,
  query,
  category,
  loading,
  onQueryChange,
  onCategoryChange,
  onOpen,
  onStartWriting,
}) {
  const pillClass = (active) =>
    `px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer ${
      active
        ? 'bg-primary-600 text-white shadow-xs'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`

  return (
    <div className="w-full space-y-6" data-testid="public-article-list">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-10 sm:px-10 shadow-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Delcom Blog</h1>
        <p className="mt-2 text-sm sm:text-base text-primary-100 max-w-2xl">
          Platform publikasi artikel: baca tulisan terbaru dari para penulis, atau mulai menulis dengan bantuan AI yang
          terhubung ke mesin pencari.
        </p>
        <button
          type="button"
          onClick={onStartWriting}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-700 text-sm font-bold shadow hover:bg-primary-50 transition cursor-pointer"
        >
          <IconPencil size={16} />
          <span>Mulai Menulis</span>
        </button>
      </section>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="relative">
          <input
            type="text"
            aria-label="Cari artikel"
            placeholder="Cari artikel berdasarkan kata kunci..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">
            <IconSearch size={16} />
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" data-testid="category-pills">
          <button type="button" onClick={() => onCategoryChange('')} className={pillClass(category === '')}>
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={pillClass(category === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards */}
      {loading ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-10">Memuat artikel...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <p className="text-base font-medium">Belum ada artikel yang cocok.</p>
          <p className="text-sm mt-1">Coba kata kunci atau kategori lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {posts.map((post) => (
            <article
              key={post.id}
              data-testid={`article-card-${post.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              {post.cover_image_path && (
                <img
                  src={post.cover_image_path}
                  alt={`Sampul ${post.title}`}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-5 flex flex-col flex-1 gap-3">
                <span className="self-start text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                  {post.category}
                </span>
                <button
                  type="button"
                  onClick={() => onOpen(post)}
                  className="text-left text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition cursor-pointer"
                >
                  {post.title}
                </button>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{post.excerpt}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1 pt-2">
                    <IconUser size={14} />
                    {post.author ? post.author.username : 'Anonim'}
                  </span>
                  <span className="pt-2">{formatDate(post.published_at)}</span>
                  <span className="inline-flex items-center gap-1 pt-2">
                    <IconClock size={14} />
                    {post.reading_time} menit baca
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
