import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { page_type, page_id } = await request.json();

    if (!page_type || !page_id) {
      return NextResponse.json(
        { error: 'page_type and page_id are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get visitor IP from x-forwarded-for header
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // 24h dedup: check if same IP + same page already recorded today
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from('page_views')
      .select('id')
      .eq('visitor_ip', ip)
      .eq('page_type', page_type)
      .eq('page_id', page_id)
      .gte('created_at', twentyFourHoursAgo)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ skipped: true });
    }

    // Insert new page view
    const { error } = await supabase.from('page_views').insert({
      page_type,
      page_id,
      visitor_ip: ip,
    });

    if (error) {
      console.error('Failed to record page view:', error);
      return NextResponse.json(
        { error: 'Failed to record page view' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error('Analytics API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
