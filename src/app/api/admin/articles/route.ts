import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb, queryAll } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const articles = await queryAll('SELECT * FROM articles ORDER BY created_at DESC');
  return NextResponse.json({ articles });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const body = await req.json();
    const { title_en, title_ta, slug, excerpt_en, excerpt_ta, content_en, content_ta, category, read_time } = body;
    const id = `art-${Date.now()}`;
    const cleanSlug = slug || String(title_en || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await execute(
      `INSERT INTO articles (id, slug, title_en, title_ta, excerpt_en, excerpt_ta, content_en, content_ta, category, read_time, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, cleanSlug, title_en, title_ta, excerpt_en, excerpt_ta, content_en, content_ta, category || 'General', read_time || '5 min read']
    );
    return NextResponse.json({ success: true, id, slug: cleanSlug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save article' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await initDb();
  await execute('DELETE FROM articles WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
