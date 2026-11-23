import React, { useState, useEffect, useCallback } from 'react'
import useTheme from './hooks/useTheme'
import apiHelper from './helpers/apiHelper'
import { showErrorAlert, showConfirmDialog } from './helpers/toolsHelper'
import authApi from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import blogApi from './features/blog/api/blogApi'
import adminApi from './features/admin/api/adminApi'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import AdminDashboard from './features/admin/components/AdminDashboard'
import PostModal from './features/blog/modals/PostModal'
import AiPostGeneratorModal from './features/blog/modals/AiPostGeneratorModal'

const SLUG_PATTERN = /^\/posts\/([^/]+)\/?$/

// Menentukan halaman yang ditampilkan berdasarkan path dan pengguna aktif
function resolveView(path, user) {
  if (path === '/login') return 'login'
  if (path === '/register') return 'register'
  if (SLUG_PATTERN.test(path)) return 'detail'
  if (path === '/author') return user ? 'author' : 'login'
  if (path === '/admin') {
    if (!user) return 'login'
    return user.role === 'admin' ? 'admin' : 'forbidden'
  }
  return 'public'
}

const CLOSED_POST_MODAL = { open: false, post: null, initial: null }

export default function App() {
  const { mode, accent, accents, toggleMode, changeAccent } = useTheme()

  const [currentUser, setCurrentUser] = useState(() => apiHelper.getUser())
  const [path, setPath] = useState(window.location.pathname)
  const [flash, setFlash] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  // Publik
  const [categories, setCategories] = useState([])
  const [publicPosts, setPublicPosts] = useState([])
  const [publicLoading, setPublicLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Penulis
  const [myPosts, setMyPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [postModal, setPostModal] = useState(CLOSED_POST_MODAL)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  // Admin
  const [adminUsers, setAdminUsers] = useState([])
  const [adminPosts, setAdminPosts] = useState([])

  const view = resolveView(path, currentUser)
  const slugMatch = path.match(SLUG_PATTERN)
  const slug = slugMatch ? decodeURIComponent(slugMatch[1]) : null

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  // Pesan notifikasi singkat; dihapus otomatis oleh efek di bawah
  const notify = setFlash

  useEffect(() => {
    if (!flash) return undefined
    const timer = setTimeout(setFlash, 3000, '')
    return () => clearTimeout(timer)
  }, [flash])

  // Sinkronisasi tombol back/forward browser
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Daftar kategori (publik)
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await blogApi.getCategories()
        if (active) setCategories(data)
      } catch (err) {
        showErrorAlert(err.message)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  // Daftar artikel publik: pencarian real-time & filter kategori
  useEffect(() => {
    if (view !== 'public') return undefined
    let active = true
    const load = async () => {
      setPublicLoading(true)
      try {
        const data = await blogApi.getPublicPosts({ q: query, category })
        if (active) setPublicPosts(data)
      } catch {
        if (active) setPublicPosts([])
      } finally {
        if (active) setPublicLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [view, query, category])

  // Detail artikel publik berdasarkan slug
  useEffect(() => {
    if (view !== 'detail') return undefined
    let active = true
    const load = async () => {
      setDetailLoading(true)
      try {
        const data = await blogApi.getPublicPostBySlug(slug)
        if (active) setDetail(data)
      } catch {
        if (active) setDetail(null)
      } finally {
        if (active) setDetailLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [view, slug])

  // Data workspace penulis
  const loadAuthorData = useCallback(async () => {
    try {
      const [postsData, statsData] = await Promise.all([blogApi.getMyPosts(), blogApi.getStats()])
      setMyPosts(postsData)
      setStats(statsData)
    } catch (err) {
      showErrorAlert(err.message)
    }
  }, [])

  useEffect(() => {
    if (view === 'author') loadAuthorData()
  }, [view, loadAuthorData])

  // Data admin
  useEffect(() => {
    if (view !== 'admin') return
    const load = async () => {
      try {
        const [usersData, postsData] = await Promise.all([adminApi.getUsers(), adminApi.getPosts()])
        setAdminUsers(usersData)
        setAdminPosts(postsData)
      } catch (err) {
        showErrorAlert(err.message)
      }
    }
    load()
  }, [view])

  // ------------------------------------------------------------ Autentikasi
  const completeAuth = (data) => {
    apiHelper.putAccessToken(data.token)
    apiHelper.putUser(data.user)
    setCurrentUser(data.user)
    navigate(data.user.role === 'admin' ? '/admin' : '/author')
    notify(`Selamat datang, ${data.user.username}!`)
  }

  const handleLogin = async ({ username, password }) => {
    const data = await authApi.login(username, password)
    completeAuth(data)
  }

  const handleRegister = async ({ username, email, password, role }) => {
    const data = await authApi.register(username, email, password, role)
    completeAuth(data)
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Sesi lokal tetap dibersihkan walau server tidak merespons
    }
    apiHelper.putAccessToken('')
    apiHelper.putUser(null)
    setCurrentUser(null)
    setMyPosts([])
    setStats(null)
    navigate('/')
    notify('Anda telah keluar.')
  }

  // ------------------------------------------------------------ Aksi penulis
  const handleSavePost = async (payload) => {
    try {
      if (postModal.post) {
        await blogApi.updatePost(postModal.post.id, payload)
        notify('Artikel berhasil diperbarui.')
      } else {
        await blogApi.createPost(payload)
        notify('Artikel berhasil dibuat.')
      }
      setPostModal(CLOSED_POST_MODAL)
      await loadAuthorData()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleTogglePublish = async (post) => {
    try {
      const updated = await blogApi.togglePublish(post.id)
      notify(updated.is_published ? 'Artikel berhasil diterbitkan.' : 'Artikel dikembalikan ke draf.')
      await loadAuthorData()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleDeletePost = async (post) => {
    const confirmed = await showConfirmDialog(`Hapus artikel "${post.title}"? Tindakan ini tidak dapat dibatalkan.`)
    if (!confirmed) return
    try {
      await blogApi.deletePost(post.id)
      notify('Artikel berhasil dihapus.')
      await loadAuthorData()
    } catch (err) {
      showErrorAlert(err.message)
    }
  }

  const handleGenerateAi = async (params) => {
    setAiLoading(true)
    let result = null
    try {
      result = await blogApi.generateAiPost(params)
    } catch (err) {
      showErrorAlert(err.message)
    }
    setAiLoading(false)
    return result
  }

  const handleApplyAi = (result) => {
    setAiOpen(false)
    setPostModal({
      open: true,
      post: null,
      initial: {
        title: result.title,
        category: result.category,
        excerpt: result.excerpt,
        content: result.content,
      },
    })
  }

  // ------------------------------------------------------------ Admin
  const handleLoadUserPosts = async (userId) => {
    try {
      return await adminApi.getUserPosts(userId)
    } catch (err) {
      showErrorAlert(err.message)
      return []
    }
  }

  const startWriting = () => {
    if (currentUser) {
      navigate('/author')
    } else {
      setIsAuthOpen(true)
    }
  }

  // ------------------------------------------------------------ Render
  if (view === 'login' || view === 'register') {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        data-testid="app-container"
      >
        <AuthPage mode={view} onLogin={handleLogin} onRegister={handleRegister} onNavigate={navigate} />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
      data-testid="app-container"
    >
      <StickyNavbar
        user={currentUser}
        mode={mode}
        accent={accent}
        accents={accents}
        onToggleMode={toggleMode}
        onChangeAccent={changeAccent}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {flash && (
        <div
          role="status"
          className="mx-4 sm:mx-6 lg:mx-8 mt-4 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-sm font-medium"
        >
          {flash}
        </div>
      )}

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        {view === 'public' && (
          <PublicArticleList
            posts={publicPosts}
            categories={categories}
            query={query}
            category={category}
            loading={publicLoading}
            onQueryChange={setQuery}
            onCategoryChange={setCategory}
            onOpen={(post) => navigate(`/posts/${post.slug}`)}
            onStartWriting={startWriting}
          />
        )}

        {view === 'detail' && (
          <div className="max-w-4xl mx-auto">
            <PublicArticleDetail post={detail} loading={detailLoading} onBack={() => navigate('/')} />
          </div>
        )}

        {view === 'author' && (
          <AuthorDashboard
            posts={myPosts}
            stats={stats}
            onCreate={() => setPostModal({ open: true, post: null, initial: null })}
            onAiGenerate={() => setAiOpen(true)}
            onEdit={(post) => setPostModal({ open: true, post, initial: null })}
            onToggle={handleTogglePublish}
            onDelete={handleDeletePost}
            onOpen={(post) => navigate(`/posts/${post.slug}`)}
          />
        )}

        {view === 'admin' && <AdminDashboard users={adminUsers} posts={adminPosts} onLoadUserPosts={handleLoadUserPosts} />}

        {view === 'forbidden' && (
          <div className="text-center py-20 space-y-3" data-testid="forbidden">
            <h2 className="text-xl font-bold">Akses Ditolak</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Halaman ini hanya untuk Administrator.</p>
          </div>
        )}
      </main>

      {isAuthOpen && (
        <AuthModal isOpen={true} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />
      )}

      {postModal.open && (
        <PostModal
          isOpen={true}
          post={postModal.post}
          initialData={postModal.initial}
          categories={categories}
          onClose={() => setPostModal(CLOSED_POST_MODAL)}
          onSave={handleSavePost}
        />
      )}

      {aiOpen && (
        <AiPostGeneratorModal
          isOpen={true}
          categories={categories}
          loading={aiLoading}
          onClose={() => setAiOpen(false)}
          onGenerate={handleGenerateAi}
          onApply={handleApplyAi}
        />
      )}
    </div>
  )
}
