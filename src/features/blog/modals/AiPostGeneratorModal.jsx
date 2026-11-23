import React, { useState } from 'react'
import { IconSparkles, IconX, IconWorldSearch } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500'

export default function AiPostGeneratorModal({ isOpen, categories, loading, onClose, onGenerate, onApply }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [result, setResult] = useState(null)

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (topic.trim() === '') return
    const res = await onGenerate({
      topic: topic.trim(),
      category,
      include_web_search: includeWebSearch,
    })
    if (res) {
      setResult(res)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn"
      data-testid="ai-post-modal"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-[96vw] h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <IconSparkles size={20} />
            <h3 className="text-base font-bold">AI Blog Generator</h3>
          </div>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="ai-topic" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Topik Artikel
              </label>
              <input
                id="ai-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Tren framework web 2026"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ai-category" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Kategori
              </label>
              <select
                id="ai-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">Otomatis (dipilih AI)</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <label className="lg:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                id="ai-web-search"
                data-testid="ai-toggle-search"
                type="checkbox"
                checked={includeWebSearch}
                onChange={(e) => setIncludeWebSearch(e.target.checked)}
                className="w-4 h-4 accent-violet-600"
              />
              <IconWorldSearch size={16} />
              <span>Sertakan fakta terkini dari Search Engine</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              <IconSparkles size={16} />
              <span>{loading ? 'AI sedang menulis...' : 'Hasilkan Artikel via AI'}</span>
            </button>
          </form>

          {result && (
            <div className="space-y-4" data-testid="ai-result">
              <div className="rounded-2xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/60 dark:bg-violet-950/20 p-5 space-y-2">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                  {result.category}
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{result.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{result.excerpt}</p>
              </div>

              {result.search_sources && result.search_sources.length > 0 && (
                <div
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
                  data-testid="ai-search-sources"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Sumber Penelusuran
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    {result.search_sources.map((src, idx) => (
                      <li key={idx}>{src}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <MarkdownViewer content={result.content} />
              </div>
            </div>
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
            type="button"
            disabled={!result}
            onClick={() => onApply(result)}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Terapkan ke Editor
          </button>
        </div>
      </div>
    </div>
  )
}
