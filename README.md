# Delcom Blog — Frontend (ReactJS Static SPA)

SPA statis platform publikasi artikel dengan **Feature-First Architecture**, penulisan **Markdown** (Toast UI Editor), dan **AI Blog Generator** terintegrasi Search Engine. Dibangun dengan React 18, Vite, Tailwind CSS 4, dan Vitest (TDD).

## Menjalankan

```bash
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8081/api, VITE_PORT=5174
npm install
npm run dev                 # http://localhost:5174 (proxy /api -> backend :8081)
```

Pastikan backend (`ifs24035-pabwe2026-sk-p9-be-golang-gin`) sudah berjalan di port 8081.

## Pengujian

```bash
npm test                    # vitest run --coverage (threshold 100%)
```

## Struktur (Feature-First)

```
src/
  components/          MarkdownEditor, MarkdownViewer (+ test)
  helpers/             apiHelper (fetch + JWT), toolsHelper (format tanggal, SweetAlert)
  hooks/               useInput, useTheme (mode gelap/terang + aksen)
  features/
    auth/              api/authApi, components/AuthPage, modals/AuthModal
    blog/
      api/             blogApi
      components/      StickyNavbar, PublicArticleList, PublicArticleDetail,
                       AuthorDashboard, PostStats
      modals/          PostModal (editor full-screen), AiPostGeneratorModal
    admin/             api/adminApi, components/AdminDashboard
  App.jsx              routing History API + orkestrasi state
```

## Rute

| Path | Akses | Halaman |
|---|---|---|
| `/` | Publik | Daftar artikel terbit, pencarian real-time, filter kategori |
| `/posts/:slug` | Publik | Detail artikel (Markdown, penulis, reading time) |
| `/login`, `/register` | Publik | Autentikasi |
| `/author` | Login | Workspace penulis: statistik, CRUD, toggle terbit/draf, AI Generator |
| `/admin` | Admin | Monitoring pengguna & seluruh artikel |

## AI Blog Generator

Di workspace penulis klik **AI Generator**, isi topik (+ kategori opsional), biarkan **Sertakan fakta terkini dari Search Engine** tercentang, lalu **Hasilkan Artikel via AI**. Hasil (judul, kategori, ringkasan, konten Markdown, dan daftar sumber penelusuran) ditampilkan sebagai pratinjau; **Terapkan ke Editor** membuka editor artikel yang sudah terisi, siap disimpan sebagai draf atau langsung diterbitkan.
