import json
import os
import glob

# Read the .env.local for Supabase credentials
env = {}
with open('.env.local') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, val = line.split('=', 1)
            env[key.strip()] = val.strip().strip('"').strip("'")

SUPABASE_URL = env.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local")
    exit(1)

print(f"Using Supabase: {SUPABASE_URL}")

import urllib.request

def supabase_request(method, path, data=None):
    url = f"{SUPABASE_URL}{path}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

# Delete all existing notes
print("Deleting existing notes...")
result = supabase_request('DELETE', '/rest/v1/notes?title=neq.empty')
print(f"Deleted notes")

# Get admin user ID
profiles = supabase_request('GET', '/rest/v1/profiles?username=eq.lvye&select=id')
admin_id = profiles[0]['id']
print(f"Admin ID: {admin_id}")

# Get category ID
cats = supabase_request('GET', '/rest/v1/categories?name=eq.AI 动态&select=id')
if not cats:
    # Create category
    cat = supabase_request('POST', '/rest/v1/categories', {
        'name': 'AI 动态',
        'description': '来自 Linux.do 社区的 AI 前沿资讯与讨论',
        'color': '#10b981',
        'user_id': admin_id
    })
    cat_id = cat[0]['id']
else:
    cat_id = cats[0]['id']
print(f"Category ID: {cat_id}")

# Read markdown files
posts_dir = 'D:/CC/linux-do-ai-posts'
files = sorted(glob.glob(os.path.join(posts_dir, '*.md')))

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title from first H1
    lines = content.split('\n')
    title = lines[0].replace('# ', '').strip()

    # Extract source line for summary
    summary = ''
    tags = []
    for line in lines:
        if line.startswith('> 来源'):
            continue
        if line.startswith('## '):
            # Find first real paragraph after a heading for summary
            continue

    # Generate summary from content
    summary_map = {
        '01-opus48': 'Anthropic 通过机制可解释性研究发现，Opus 4.8 的"降智"并非能力下降，而是模型学会了"摸鱼"。',
        '02-AI高考': '2026 年新高考 I 卷数学 AI 实测：GPT-5.5 连续满分，Qwen 3.7 Max 国产之光。',
        '03-Claude存活': 'Claude 订阅四个月未被封号的真实经验：实体卡支付是核心，账号年龄很重要。',
        '04-AI辅助开发': 'AI 辅助开发的三大痛点：项目结构失控、AI 过度开发、数据库混乱。',
        '05-fable5': '使用 Fable 5 + Ultracode 连续运行 10 小时后账号被封。虚拟卡 + 高强度使用是高风险组合。',
        '06-自费买token': '自费买 AI Token 已成职场普遍现象：开发者用自费工具提高效率，企业 IT 采购滞后。',
    }

    tag_map = {
        '01-opus48': ['Claude', 'Anthropic', '大模型', '降智', '可解释性'],
        '02-AI高考': ['AI测试', '高考', 'GPT-5.5', 'Qwen', 'Gemini'],
        '03-Claude存活': ['Claude', '封号', '经验分享', '支付方式', '风控'],
        '04-AI辅助开发': ['AI开发', '项目管理', '架构设计', '重构', '新媒体'],
        '05-fable5': ['Claude', 'Fable5', '封号', 'Ultracode', '风控'],
        '06-自费买token': ['AI工具', '职场', '企业采购', 'Token', '开发效率'],
    }

    basename = os.path.basename(filepath)[:8]
    summary = summary_map.get(basename, title[:50])
    tags = tag_map.get(basename, [])

    # Remove the first line (title) and metadata lines from content for the body
    body_lines = []
    skip_meta = True
    for line in lines[1:]:
        if skip_meta and (line.startswith('>') or line.startswith('---') or line == ''):
            continue
        skip_meta = False
        body_lines.append(line)
    body = '\n'.join(body_lines)

    note_data = {
        'title': title,
        'content': body,
        'summary': summary,
        'tags': tags,
        'category_id': cat_id,
        'author_id': admin_id,
        'is_private': False
    }

    print(f"Inserting: {title[:40]}...")
    result = supabase_request('POST', '/rest/v1/notes', note_data)
    print(f"  OK - id: {result[0]['id']}")

print("\nDone! All 6 notes imported with proper newlines.")
