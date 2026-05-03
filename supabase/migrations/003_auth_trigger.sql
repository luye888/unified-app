-- Migration 003: Auth trigger and default data
-- Run this in Supabase SQL Editor AFTER 002_rls_policies.sql

-- ============================================================
-- Trigger: auto-create profile on user signup
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Default site settings
-- ============================================================
INSERT INTO site_settings (key, value)
VALUES
  ('site_title', '"绿叶的个人空间"'::jsonb),
  ('bio', '"热爱技术与生活的绿叶"'::jsonb),
  ('social_links', '{"github": "https://github.com/luye888"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
