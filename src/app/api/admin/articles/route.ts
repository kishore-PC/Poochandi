import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb, queryAll, queryOne } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const articles = await queryAll('SELECT * FROM articles ORDER BY created_at DESC');
  return NextResponse.json({ articles });
}

function cleanSlug(input: string) {
  return String(input || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `article-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const body = await req.json();
    const { title_en, title_ta, slug, excerpt_en, excerpt_ta, content_en, content_ta, category, read_time, seo_keywords, published } = body;
    const id = `art-${Date.now()}`;
    const finalSlug = cleanSlug(slug || title_en);
    await execute(
      `INSERT INTO articles (id, slug, title_en, title_ta, excerpt_en, excerpt_ta, content_en, content_ta, category, read_time, seo_keywords, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, finalSlug, title_en || '', title_ta || '', excerpt_en || '', excerpt_ta || '', content_en || '', content_ta || '', category || 'General', read_time || '5 min read', seo_keywords || '', published === 0 ? 0 : 1]
    );
    return NextResponse.json({ success: true, id, slug: finalSlug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save article' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const body = await req.json();
    const { id, title_en, title_ta, slug, excerpt_en, excerpt_ta, content_en, content_ta, category, read_time, seo_keywords, published } = body;
    if (!id) return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    const finalSlug = cleanSlug(slug || title_en);
    await execute(
      `UPDATE articles SET slug=?, title_en=?, title_ta=?, excerpt_en=?, excerpt_ta=?, content_en=?, content_ta=?, category=?, read_time=?, seo_keywords=?, published=?, updated_at=datetime('now') WHERE id=?`,
      [finalSlug, title_en || '', title_ta || '', excerpt_en || '', excerpt_ta || '', content_en || '', content_ta || '', category || 'General', read_time || '5 min read', seo_keywords || '', published === 0 ? 0 : 1, id]
    );
    return NextResponse.json({ success: true, id, slug: finalSlug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update article' }, { status: 500 });
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
