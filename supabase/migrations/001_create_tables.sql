-- Migration 001: Create all tables
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text UNIQUE NOT NULL,
  display_name text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  bio         text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 2. blog_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text UNIQUE NOT NULL,
  content     text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover       text,
  tags        text[] DEFAULT '{}',
  pinned      boolean DEFAULT false,
  series      text,
  author_id   uuid NOT NULL REFERENCES profiles(id),
  published   boolean DEFAULT false,
  read_time   int DEFAULT 1,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 3. projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  tech        text[],
  url         text,
  github      text,
  "order"     int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 4. categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  color       text,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 5. notes
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  content     text DEFAULT '',
  summary     text,
  tags        text[],
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_private  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 6. site_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- 7. page_views
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type   text CHECK (page_type IN ('blog', 'project', 'note')),
  page_id     uuid,
  visitor_ip  text,
  user_agent  text,
  viewed_at   timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_notes_author_id ON notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_private ON notes(is_private);
CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
