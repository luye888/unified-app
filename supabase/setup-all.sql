-- ================================================================
-- Unified App - 完整数据库初始化脚本
-- 在 Supabase SQL Editor 中运行此文件
-- ================================================================

-- ============================================================
-- 1. 创建表（先 DROP 避免 IF NOT EXISTS 的静默跳过问题）
-- ============================================================

DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- profiles（不引用 auth.users，仅存 uuid）
CREATE TABLE profiles (
  id           uuid PRIMARY KEY,
  username     text UNIQUE NOT NULL,
  display_name text,
  role         text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  bio          text,
  avatar_url   text,
  created_at   timestamptz DEFAULT now()
);

-- blog_posts
CREATE TABLE blog_posts (
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

-- projects
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  tech        text[],
  url         text,
  github      text,
  "order"     int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- categories
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  color       text,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- notes
CREATE TABLE notes (
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

-- site_settings
CREATE TABLE site_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);

-- page_views
CREATE TABLE page_views (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type   text CHECK (page_type IN ('blog', 'project', 'note')),
  page_id     uuid,
  visitor_ip  text,
  user_agent  text,
  viewed_at   timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_notes_author_id ON notes(author_id);
CREATE INDEX idx_notes_is_private ON notes(is_private);
CREATE INDEX idx_notes_category_id ON notes(category_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_page_views_page ON page_views(page_type, page_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);

-- ============================================================
-- 2. RLS 策略
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_public ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_posts_select ON blog_posts FOR SELECT USING (published = true OR author_id = auth.uid() OR is_admin());
CREATE POLICY blog_posts_insert_admin ON blog_posts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY blog_posts_update_admin ON blog_posts FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY blog_posts_delete_admin ON blog_posts FOR DELETE USING (is_admin());

-- projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_select_public ON projects FOR SELECT USING (true);
CREATE POLICY projects_insert_admin ON projects FOR INSERT WITH CHECK (is_admin());
CREATE POLICY projects_update_admin ON projects FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY projects_delete_admin ON projects FOR DELETE USING (is_admin());

-- notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY notes_select ON notes FOR SELECT USING (is_private = false OR author_id = auth.uid() OR is_admin());
CREATE POLICY notes_insert_own ON notes FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY notes_update ON notes FOR UPDATE USING (author_id = auth.uid() OR is_admin()) WITH CHECK (author_id = auth.uid() OR is_admin());
CREATE POLICY notes_delete ON notes FOR DELETE USING (author_id = auth.uid() OR is_admin());

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_select ON categories FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY categories_insert_own ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_update_own ON categories FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_delete_own ON categories FOR DELETE USING (user_id = auth.uid());

-- site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_settings_select_public ON site_settings FOR SELECT USING (true);
CREATE POLICY site_settings_insert_admin ON site_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY site_settings_update_admin ON site_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- page_views
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY page_views_insert_public ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY page_views_select_admin ON page_views FOR SELECT USING (is_admin());

-- ============================================================
-- 3. Auth 触发器
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, role)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. 默认数据 + 管理员账户
-- ============================================================

-- 站点设置
INSERT INTO site_settings (key, value) VALUES
  ('site_title', '"绿叶的个人空间"'::jsonb),
  ('bio', '"热爱技术与生活的绿叶"'::jsonb),
  ('social_links', '{"github": "https://github.com/luye888"}'::jsonb);

-- 管理员 lvye（Auth 用户 ID: b5d893e4-2ba0-4a59-a0a5-489142f71edc）
INSERT INTO profiles (id, username, role)
VALUES ('b5d893e4-2ba0-4a59-a0a5-489142f71edc', 'lvye', 'admin');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
