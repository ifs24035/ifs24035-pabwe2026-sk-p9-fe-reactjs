import React, { useState } from 'react'
import { IconLock } from '@tabler/icons-react'

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (tab === 'login') {
        await onLogin({ username, password })
      } else {
        await onRegister({ username, email, password, role })
      }
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan autentikasi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      data-testid="auth-modal"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-w-md w-full overflow-hidden transition-all my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-white/10 rounded-lg flex items-center justify-center">
              <IconLock size={20} />
            </span>
            <h3 className="text-base font-bold">
              {tab === 'login' ? 'Masuk ke Delcom Blog' : 'Daftar Akun Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => {
              setTab('login')
              setErrorMsg('')
            }}
            className={`flex-1 py-3 text-sm font-semibold transition cursor-pointer ${tab === 'login'
              ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-900'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register')
              setErrorMsg('')
            }}
            className={`flex-1 py-3 text-sm font-semibold transition cursor-pointer ${tab === 'register'
              ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-900'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username atau Email
            </label>
            <input
              type="text"
              required
              id="login-username"
              data-testid="input-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Anda"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                required
                data-testid="input-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              id="login-password"
              data-testid="input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Peran Pengguna
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
              >
                <option value="member">Member (Pengguna Biasa)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              data-testid="btn-submit-auth"
              className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Memproses...'
                : tab === 'login'
                  ? 'Masuk Sekarang'
                  : 'Daftar Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
