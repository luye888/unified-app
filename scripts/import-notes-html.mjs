import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

// Read .env.local
const env = {};
readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`Supabase: ${SUPABASE_URL}`);

async function api(method, path, data) {
  const resp = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: data ? JSON.stringify(data) : undefined
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status}: ${text}`);
  }
  return resp.json();
}

// Delete all existing notes
console.log('Clearing notes...');
await api('DELETE', '/rest/v1/notes?title=neq.empty');

// Get admin
const [profile] = await api('GET', '/rest/v1/profiles?username=eq.lvye&select=id');
const adminId = profile.id;

// Get or create category
let cats = await api('GET', '/rest/v1/categories?name=eq.AI%20动态&select=id');
let catId;
if (cats.length === 0) {
  const [cat] = await api('POST', '/rest/v1/categories', {
    name: 'AI 动态', description: '来自 Linux.do 社区的 AI 前沿资讯与讨论',
    color: '#10b981', user_id: adminId
  });
  catId = cat.id;
} else {
  catId = cats[0].id;
}
console.log(`Category: ${catId}`);

// Read markdown files and convert to HTML
const postsDir = 'D:/CC/linux-do-ai-posts';
const files = readdirSync(postsDir).filter(f => f.endsWith('.md')).sort();

const metaMap = {
  '01': { summary: 'Anthropic 通过机制可解释性研究发现，Opus 4.8 的"降智"并非能力下降，而是模型学会了"摸鱼"。', tags: ['Claude','Anthropic','大模型','降智','可解释性'] },
  '02': { summary: 'GPT-5.5 连续满分，Qwen 3.7 Max 国产之光，高考数学已不是 AI 的挑战。', tags: ['AI测试','高考','GPT-5.5','Qwen','Gemini'] },
  '03': { summary: 'Claude 订阅四个月未被封号：实体卡支付是核心，账号年龄很重要。', tags: ['Claude','封号','经验分享','支付方式','风控'] },
  '04': { summary: 'AI 辅助开发的三大痛点：项目结构失控、AI 过度开发、数据库混乱。', tags: ['AI开发','项目管理','架构设计','重构','新媒体'] },
  '05': { summary: '使用 Fable 5 + Ultracode 连续运行 10 小时后账号被封。', tags: ['Claude','Fable5','封号','Ultracode','风控'] },
  '06': { summary: '自费买 AI Token 已成职场普遍现象。', tags: ['AI工具','职场','企业采购','Token','开发效率'] },
};

for (const file of files) {
  const raw = readFileSync(join(postsDir, file), 'utf8');
  const lines = raw.split('\n');
  const title = lines[0].replace(/^#\s+/, '').trim();

  // Skip title line and metadata lines (> source, ---)
  const bodyLines = [];
  let skipMeta = true;
  for (const line of lines.slice(1)) {
    if (skipMeta && (line.startsWith('>') || line === '---' || line === '')) continue;
    skipMeta = false;
    bodyLines.push(line);
  }
  const markdown = bodyLines.join('\n');

  // Convert markdown to HTML
  const html = marked.parse(markdown);

  const prefix = file.slice(0, 2);
  const meta = metaMap[prefix] || { summary: title, tags: [] };

  console.log(`Inserting: ${title.slice(0, 40)}... (${html.length} chars HTML)`);
  const [note] = await api('POST', '/rest/v1/notes', {
    title, content: html, summary: meta.summary, tags: meta.tags,
    category_id: catId, author_id: adminId, is_private: false
  });
  console.log(`  OK id: ${note.id}`);
}

console.log('\nDone! All notes stored as HTML.');
