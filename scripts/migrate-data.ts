/**
 * migrate-data.ts
 *
 * Reads markdown content from the old my-site project and inserts it
 * into the Supabase database used by the unified Next.js app.
 *
 * Usage:
 *   npx tsx scripts/migrate-data.ts
 *
 * IMPORTANT: You must set these environment variables before running:
 *   NEXT_PUBLIC_SUPABASE_URL    — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   — your Supabase service role key (NOT the anon key)
 *
 * IMPORTANT: Replace the <ADMIN_USER_ID> placeholder below with the actual
 * UUID of an admin user from your profiles table. You can find this by
 * running `SELECT id FROM profiles WHERE role = 'admin';` in the SQL Editor.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// >>> REPLACE THIS with the real admin user UUID before running <<<
const ADMIN_USER_ID = "<ADMIN_USER_ID>";

const MY_SITE_CONTENT = path.resolve("D:/CC/my-site/src/content");
const BLOG_DIR = path.join(MY_SITE_CONTENT, "blog");
const PROJECTS_DIR = path.join(MY_SITE_CONTENT, "projects");
const SETTINGS_FILE = path.join(MY_SITE_CONTENT, "settings.json");

// ---------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS)
// ---------------------------------------------------------------------------

function getSupabase() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readMarkdownFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found, skipping: ${dir}`);
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data, content } = matter(raw);
      const slug = filename.replace(/\.md$/, "");
      return { filename, slug, frontmatter: data, content };
    });
}

// ---------------------------------------------------------------------------
// 1. Blog posts
// ---------------------------------------------------------------------------

async function migrateBlogPosts(supabase: ReturnType<typeof createClient>) {
  console.log("\n--- Migrating blog posts ---");

  if (ADMIN_USER_ID === "<ADMIN_USER_ID>") {
    throw new Error(
      "ADMIN_USER_ID is still the placeholder. Replace it with a real user UUID before running."
    );
  }

  const files = readMarkdownFiles(BLOG_DIR);
  if (files.length === 0) {
    console.log("  No blog posts found.");
    return;
  }

  let inserted = 0;
  for (const { slug, frontmatter, content } of files) {
    const title = frontmatter.title ?? slug;
    const description = frontmatter.description ?? "";
    const tags: string[] = Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : [];
    const pinned = frontmatter.pinned === true;
    const series = frontmatter.series ?? null;
    const cover = frontmatter.cover ?? null;

    // reading time: ceil(content length / 500) minutes
    const readTime = Math.max(1, Math.ceil(content.length / 500));

    const row = {
      title,
      slug,
      content,
      description,
      cover,
      tags,
      pinned,
      series,
      author_id: ADMIN_USER_ID,
      published: true,
      read_time: readTime,
    };

    const { error } = await supabase
      .from("blog_posts")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`  FAILED [${slug}]:`, error.message);
    } else {
      console.log(`  OK  ${slug}`);
      inserted++;
    }
  }

  console.log(`  Blog posts: ${inserted}/${files.length} migrated.`);
}

// ---------------------------------------------------------------------------
// 2. Projects
// ---------------------------------------------------------------------------

async function migrateProjects(supabase: ReturnType<typeof createClient>) {
  console.log("\n--- Migrating projects ---");

  const files = readMarkdownFiles(PROJECTS_DIR);
  if (files.length === 0) {
    console.log("  No projects found.");
    return;
  }

  let inserted = 0;
  for (const { slug, frontmatter } of files) {
    const title = frontmatter.title ?? slug;
    const description = frontmatter.description ?? "";
    const tech: string[] = Array.isArray(frontmatter.tech)
      ? frontmatter.tech
      : [];
    const url = frontmatter.url ?? null;
    const github = frontmatter.github ?? null;
    const order = typeof frontmatter.order === "number" ? frontmatter.order : 0;

    const row = {
      title,
      description,
      tech,
      url,
      github,
      order,
    };

    const { error } = await supabase.from("projects").upsert(row, {
      onConflict: "title",
    });

    if (error) {
      console.error(`  FAILED [${slug}]:`, error.message);
    } else {
      console.log(`  OK  ${slug}`);
      inserted++;
    }
  }

  console.log(`  Projects: ${inserted}/${files.length} migrated.`);
}

// ---------------------------------------------------------------------------
// 3. Site settings
// ---------------------------------------------------------------------------

async function migrateSettings(supabase: ReturnType<typeof createClient>) {
  console.log("\n--- Migrating site settings ---");

  if (!fs.existsSync(SETTINGS_FILE)) {
    console.warn(`  Settings file not found: ${SETTINGS_FILE}`);
    return;
  }

  const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));

  const rows = [
    { key: "site_title", value: settings.site?.title ?? "" },
    { key: "bio", value: settings.personal ?? {} },
    { key: "social_links", value: settings.social ?? {} },
  ];

  let inserted = 0;
  for (const row of rows) {
    const { error } = await supabase
      .from("site_settings")
      .upsert(row, { onConflict: "key" });

    if (error) {
      console.error(`  FAILED [${row.key}]:`, error.message);
    } else {
      console.log(`  OK  ${row.key}`);
      inserted++;
    }
  }

  console.log(`  Settings: ${inserted}/${rows.length} migrated.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Data Migration: my-site -> Supabase ===");
  console.log(`Source: ${MY_SITE_CONTENT}`);

  const supabase = getSupabase();

  await migrateBlogPosts(supabase);
  await migrateProjects(supabase);
  await migrateSettings(supabase);

  console.log("\n=== Migration complete ===");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
