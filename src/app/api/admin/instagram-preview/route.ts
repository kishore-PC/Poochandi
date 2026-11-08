import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const reelUrl = searchParams.get('url');

  if (!reelUrl) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    // Attempt Instagram official oEmbed endpoint
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(reelUrl)}`;
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        title: data.title || '',
        thumbnail_url: data.thumbnail_url || '',
        author_name: data.author_name || 'poochandi.in',
      });
    }

    // Fallback response allowing manual thumbnail upload
    return NextResponse.json({
      fallback: true,
      message: 'Instagram embed preview fetched.',
      url: reelUrl,
    });
  } catch (error) {
    return NextResponse.json({
      fallback: true,
      message: 'Could not fetch oEmbed preview directly.',
    });
  }
}
