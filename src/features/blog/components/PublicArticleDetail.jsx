import React from 'react'
import { IconArrowLeft, IconClock, IconUser, IconCalendar } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { formatDate } from '../../../helpers/toolsHelper'

export default function PublicArticleDetail({ post, loading, onBack }) {
  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
    >
      <IconArrowLeft size={16} />
      <span>Kembali ke Beranda</span>
    </button>
  )

  if (loading) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-16" data-testid="article-loading">
        Memuat artikel...
      </p>
    )
  }

  if (!post) {
    return (
      <div className="w-full space-y-4 py-10 text-center" data-testid="article-not-found">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Artikel tidak ditemukan.</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Artikel mungkin belum diterbitkan atau sudah dihapus oleh penulisnya.
        </p>
        {backButton}
      </div>
    )
  }

  return (
    <article className="w-full space-y-6" data-testid="public-article-detail">
      {backButton}

      <header className="space-y-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <IconUser size={16} />
            {post.author ? post.author.username : 'Anonim'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar size={16} />
            {formatDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock size={16} />
            {post.reading_time} menit baca
          </span>
        </div>
      </header>

      {post.cover_image_path && (
        <img
          src={post.cover_image_path}
          alt={`Sampul ${post.title}`}
          className="w-full max-h-[420px] object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
        />
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-10">
        <MarkdownViewer content={post.content} />
      </div>
    </article>
  )
}
