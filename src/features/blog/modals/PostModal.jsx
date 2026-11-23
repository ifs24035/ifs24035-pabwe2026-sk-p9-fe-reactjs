import React, { useState } from 'react'
import { IconX, IconDeviceFloppy } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500'

export default function PostModal({ isOpen, post, initialData, categories, onClose, onSave }) {
  const source = post || initialData || {}
  const isEdit = Boolean(post)

  const [title, setTitle] = useState(source.title || '')
  const [category, setCategory] = useState(source.category || 'Umum')
  const [excerpt, setExcerpt] = useState(source.excerpt || '')
  const [cover, setCover] = useState(source.cover_image_path || '')
  const [content, setContent] = useState(source.content || '')
  const [isPublished, setIsPublished] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (title.trim() === '') {
      setErrorMsg('Judul artikel wajib diisi.')
      return
    }
    setErrorMsg('')
    setSaving(true)

    const trimmedCover = cover.trim()
    const payload = {
      title: title.trim(),
      category,
      excerpt: excerpt.trim(),
      content,
      cover_image_path: trimmedCover === '' && source.cover_image_path ? 'DELETE' : trimmedCover,
    }
    if (!isEdit) {
      payload.is_published = isPublished
    }

    try {
      await onSave(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn"
      data-testid="post-modal"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-[96vw] h-[94vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold">{isEdit ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm" role="alert">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="post-title" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Judul Artikel
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul yang menarik..."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="post-category" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Kategori
              </label>
              <select
                id="post-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-excerpt" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Ringkasan (Excerpt)
              </label>
              <textarea
                id="post-excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat; dikosongkan akan dibuat otomatis..."
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="post-cover" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                URL Gambar Sampul (opsional)
              </label>
              <input
                id="post-cover"
                type="text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Konten (Markdown)</span>
            <MarkdownEditor value={content} onChange={setContent} height="420px" />
          </div>

          {!isEdit && (
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                id="post-published"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              <span>Terbitkan langsung</span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 bg-slate-100 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
          >
            <IconDeviceFloppy size={16} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Artikel'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
