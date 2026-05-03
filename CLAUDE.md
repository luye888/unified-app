# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Turbopack, default port 3000)
- `npm run build` — production build (also runs TypeScript checks)
- `npm run lint` — run ESLint

## Architecture

**NoteMaster** is a Chinese-language note processing app with automatic content organization and classification.

### Stack
- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Supabase (PostgreSQL) for persistence — client in `src/lib/supabase.ts`
- Tiptap rich text editor (`src/components/NoteEditor.tsx`)
- shadcn/ui components in `src/components/ui/`
- Tailwind CSS v4

### Key domain logic

`src/lib/content-organizer.ts` is the core business logic. It performs structured analysis of raw text (including voice-to-text transcripts):
- Filters oral filler words and timestamps via `cleanTranscript()`, `isUsefulSentence()`, `cleanOralFillers()`
- Extracts keywords via `extractKeywords()` (with an extensive stopword list)
- Identifies content type (技术教程, 会议记录, 学习笔记, etc.) via `analyzeContentType()`
- Produces a 5-section structured output: content type judgment, core summary, structured breakdown, concise version, transferable applications
- Auto-suggests categories via `analyzeCategory()`

`generateStructuredNote()` is the main entry point — called from both `notes/new/page.tsx` and `notes/[id]/page.tsx` with debounced auto-organization (1.5s delay).

### Data flow

Notes and categories CRUD go through `src/lib/notes.ts` and `src/lib/categories.ts` → Supabase client → `notes` and `categories` tables. RLS is disabled for development.

### Next.js specifics

- Params are async in Next.js 15+: use `const { id } = use(params)` (React `use()`) to unwrap `params: Promise<{ id: string }>`
- Tiptap editor requires `immediatelyRender: false` to avoid SSR errors
- All page components under `src/app/` are `'use client'` (client-side rendered)
