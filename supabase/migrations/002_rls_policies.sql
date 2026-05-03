-- Migration 002: Enable RLS and create policies
-- Run this in Supabase SQL Editor AFTER 001_create_tables.sql

-- ============================================================
-- Helper: check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile (for the trigger)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- blog_posts
-- ============================================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read published posts, authors can read their own
CREATE POLICY "blog_posts_select"
  ON blog_posts FOR SELECT
  USING (published = true OR author_id = auth.uid() OR is_admin());

-- Admin can insert
CREATE POLICY "blog_posts_insert_admin"
  ON blog_posts FOR INSERT
  WITH CHECK (is_admin());

-- Admin can update
CREATE POLICY "blog_posts_update_admin"
  ON blog_posts FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin can delete
CREATE POLICY "blog_posts_delete_admin"
  ON blog_posts FOR DELETE
  USING (is_admin());

-- ============================================================
-- projects
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Everyone can read projects
CREATE POLICY "projects_select_public"
  ON projects FOR SELECT
  USING (true);

-- Admin can insert
CREATE POLICY "projects_insert_admin"
  ON projects FOR INSERT
  WITH CHECK (is_admin());

-- Admin can update
CREATE POLICY "projects_update_admin"
  ON projects FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin can delete
CREATE POLICY "projects_delete_admin"
  ON projects FOR DELETE
  USING (is_admin());

-- ============================================================
-- notes
-- ============================================================
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Public notes readable by everyone, own notes readable by author, admin reads all
CREATE POLICY "notes_select"
  ON notes FOR SELECT
  USING (is_private = false OR author_id = auth.uid() OR is_admin());

-- Author can insert their own notes
CREATE POLICY "notes_insert_own"
  ON notes FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Author or admin can update
CREATE POLICY "notes_update"
  ON notes FOR UPDATE
  USING (author_id = auth.uid() OR is_admin())
  WITH CHECK (author_id = auth.uid() OR is_admin());

-- Author or admin can delete
CREATE POLICY "notes_delete"
  ON notes FOR DELETE
  USING (author_id = auth.uid() OR is_admin());

-- ============================================================
-- categories
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can read their own categories, admin can read all
CREATE POLICY "categories_select"
  ON categories FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Users can insert their own categories
CREATE POLICY "categories_insert_own"
  ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own categories
CREATE POLICY "categories_update_own"
  ON categories FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own categories
CREATE POLICY "categories_delete_own"
  ON categories FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- site_settings
-- ============================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site settings
CREATE POLICY "site_settings_select_public"
  ON site_settings FOR SELECT
  USING (true);

-- Admin can insert
CREATE POLICY "site_settings_insert_admin"
  ON site_settings FOR INSERT
  WITH CHECK (is_admin());

-- Admin can update
CREATE POLICY "site_settings_update_admin"
  ON site_settings FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- page_views
-- ============================================================
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Everyone can insert page views (anonymous tracking)
CREATE POLICY "page_views_insert_public"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- Admin can read all page views
CREATE POLICY "page_views_select_admin"
  ON page_views FOR SELECT
  USING (is_admin());
