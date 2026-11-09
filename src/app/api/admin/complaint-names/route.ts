import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb, queryAll } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';
  const exportFormat = searchParams.get('export');

  let query = 'SELECT * FROM complaint_names';
  const params: any[] = [];
  if (search) {
    query += ' WHERE child_name LIKE ? OR id LIKE ?';
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }
  query += sort === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';
  const names = await queryAll<any>(query, params);

  if (exportFormat === 'csv') {
    const headers = ['Entry ID', 'Child Name', 'Child Age', 'Status', 'Created At'];
    const rows = names.map((n) => [n.id,n.child_name,n.child_age,n.status,n.created_at].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=poochandi_complaint_names_${Date.now()}.csv` } });
  }
  return NextResponse.json({ names });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    const placeholders = ids.map(() => '?').join(',');
    await execute(`DELETE FROM complaint_names WHERE id IN (${placeholders})`, ids);
    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
