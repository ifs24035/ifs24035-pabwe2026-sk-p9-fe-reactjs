import React, { useState } from 'react'

export default function AuthPage({
  mode = 'login', // 'login' | 'register'
  onLogin,
  onRegister,
  onNavigate,
}) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await onLogin({ username, password })
      } else {
        await onRegister({ username, email, password, role })
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan autentikasi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors"
      data-testid="auth-page"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
            T
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {mode === 'login' ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? 'Masukkan kredensial Anda untuk melanjutkan ke workspace penulis'
              : 'Daftar sekarang untuk mulai menulis dan mempublikasikan artikel Anda'}
          </p>
        </div>

        {errorMsg && (
          <div
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs"
            data-testid="auth-error-msg"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={mode === 'login' ? 'login-username' : 'register-username'}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Username
            </label>
            <input
              id={mode === 'login' ? 'login-username' : 'register-username'}
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: ubaid"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@delcom.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor={mode === 'login' ? 'login-password' : 'register-password'}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Kata Sandi
            </label>
            <input
              id={mode === 'login' ? 'login-password' : 'register-password'}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="register-role"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Peran Akun
              </label>
              <select
                id="register-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button
            id={mode === 'login' ? 'login-submit' : 'register-submit'}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-100 dark:border-slate-800">
          {mode === 'login' ? (
            <p>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="font-semibold text-primary-600 hover:underline cursor-pointer"
              >
                Daftar di sini
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="font-semibold text-primary-600 hover:underline cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          )}

          <div>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            >
              &larr; Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
