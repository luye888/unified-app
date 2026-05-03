import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Auth required
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const format = searchParams.get('format') || 'md';

    // Build query
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (id) {
      query = query.eq('id', id);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error('Export query error:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    if (!notes || notes.length === 0) {
      return NextResponse.json({ error: 'No notes found' }, { status: 404 });
    }

    if (format === 'json') {
      return NextResponse.json(notes, {
        headers: {
          'Content-Disposition': `attachment; filename="notes-export.json"`,
        },
      });
    }

    // Default: markdown format
    const mdContent = notes
      .map(note => {
        const tags = note.tags ? (Array.isArray(note.tags) ? note.tags.join(', ') : note.tags) : '';
        let md = '---\n';
        md += `title: "${note.title || ''}"\n`;
        md += `tags: [${tags}]\n`;
        md += `created_at: "${note.created_at || ''}"\n`;
        md += '---\n\n';
        md += stripHtml(note.content || '');
        return md;
      })
      .join('\n\n---\n\n');

    return new NextResponse(mdContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="notes-export.md"`,
      },
    });
  } catch (err) {
    console.error('Export API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, (_, text) => `\n## ${text}\n`)
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<li>(.*?)<\/li>/gi, '- $1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
