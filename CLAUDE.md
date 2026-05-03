# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Turbopack, default port 3000)
- `npm run build` — production build (also runs TypeScript checks)
- `npm run lint` — run ESLint
- `npx tsx scripts/migrate-data.ts` — run data migration from my-site markdown files

## Architecture

**Unified Platform** — a personal website + note-taking app merged into a single Next.js application. Chinese-language, green/leaf theme.

### Stack
- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Supabase (PostgreSQL + Auth + Storage) for all backend services
- Tiptap rich text editor (`src/components/NoteEditor.tsx`)
- shadcn/ui components in `src/components/ui/`
- Tailwind CSS v4

### Route Groups

The app uses Next.js route groups to separate access levels:

- `(public)/` — no auth required: home, blog, projects, shared notes, blog archive
- `(app)/` — requires login: my notes, create/edit notes, categories
- `(admin)/` — requires admin role: dashboard, blog/project/user management, analytics, settings
- `login/`, `register/` — auth pages

Middleware (`src/middleware.ts`) enforces auth via Supabase SSR cookies. Admin role check happens for `/admin/*` paths.

### Authentication

Supabase Auth with username + password. Users sign up with `username@app.local` virtual email format (Supabase requires email field). A database trigger auto-creates a `profiles` row on signup with role='user'. First user must be manually promoted to admin via SQL.

### Data Layer

All CRUD modules in `src/lib/` use the Supabase browser client (`supabase` export from `./supabase.ts`):

| Module | Table | Key functions |
|---|---|---|
| `notes.ts` | notes | getNotes (with search/filter/authorId/publicOnly), getNote, createNote, updateNote, deleteNote |
| `blog.ts` | blog_posts | getBlogPosts, getBlogPost (by slug), getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost |
| `projects.ts` | projects | getProjects, createProject, updateProject, deleteProject |
| `categories.ts` | categories | getCategories, createCategory, updateCategory, deleteCategory |
| `settings.ts` | site_settings | getSettings, updateSetting |
| `auth.ts` | profiles | getCurrentUser, requireAuth, requireAdmin |

Server components use `createServerSupabaseClient` from `./supabase-server.ts` (cookie-based).

### Content Organizer

`src/lib/content-organizer.ts` — pure text-processing pipeline (no external API). Entry point: `generateStructuredNote(title, content)` returns structured HTML, summary, tags, and content analysis. Used in note creation/editing with 1.5s debounce. Also: `analyzeCategory(text, categories)` for auto-categorization.

### Theme System

CSS variables in `globals.css` with `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`. Theme persisted in localStorage. Key classes: `.glass-card` (glass morphism), `.gradient-text` (primary gradient).

### Key Patterns

- Notes have `is_private` (bool) and `author_id` fields for access control
- Blog posts have `published` (bool) and `author_id` for multi-author support
- Categories are per-user (`user_id` field)
- Public notes are browsable at `/shared` (not `/notes`, which is the authenticated user's notes)
- RLS policies enforce access at the database level
- AnalyticsTracker component silently records page views on mount

### Deployment

Vercel auto-deploy. Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Supabase setup: run `supabase/migrations/001-003` in SQL Editor, create `images` Storage bucket (public).
