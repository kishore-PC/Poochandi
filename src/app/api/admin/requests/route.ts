import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb, queryAll } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const exportFormat = searchParams.get('export');

  let query = 'SELECT * FROM child_requests';
  const params: any[] = [];
  if (search) {
    query += ' WHERE child_name LIKE ? OR parent_name LIKE ? OR id LIKE ?';
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }
  query += ' ORDER BY created_at DESC';
  const requests = await queryAll<any>(query, params);

  if (exportFormat === 'csv') {
    const headers = ['Request ID','Parent Name','Child Name','Nickname','Age/Grade','Behavior','City','Special Instructions','Status','Created At'];
    const rows = requests.map((r) => [r.id,r.parent_name,r.child_name,r.nickname||'',r.age_grade,r.behavior,r.city||'',r.special_instructions||'',r.status,r.created_at].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=poochandi_child_requests_${Date.now()}.csv` } });
  }
  return NextResponse.json({ requests });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    const placeholders = ids.map(() => '?').join(',');
    await execute(`DELETE FROM child_requests WHERE id IN (${placeholders})`, ids);
    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
