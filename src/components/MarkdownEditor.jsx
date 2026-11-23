import React, { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

export default function MarkdownEditor({
  value = '',
  onChange,
  height = '420px',
  placeholder = 'Tuliskan artikel Anda dalam format Markdown...',
}) {
  const editorElRef = useRef(null)
  const editorInstanceRef = useRef(null)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')

    editorInstanceRef.current = new Editor({
      el: editorElRef.current,
      height: height,
      initialEditType: 'markdown',
      previewStyle: 'tab',
      initialValue: value,
      placeholder: placeholder,
      usageStatistics: false,
      theme: isDark ? 'dark' : 'light',
      events: {
        change: () => {
          if (editorInstanceRef.current && onChange) {
            const md = editorInstanceRef.current.getMarkdown()
            onChange(md)
          }
        },
      },
    })

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (editorInstanceRef.current) {
      const current = editorInstanceRef.current.getMarkdown()
      if (value !== current) {
        editorInstanceRef.current.setMarkdown(value, false)
      }
    }
  }, [value])

  return (
    <div
      className="toastui-editor-container w-full border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white text-slate-800"
      data-testid="markdown-editor"
    >
      <div ref={editorElRef} />
    </div>
  )
}
