import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  const names = db.prepare(query).all(...params) as any[];

  if (exportFormat === 'csv') {
    const headers = ['Entry ID', 'Child Name', 'Child Age', 'Status', 'Created At'];
    const rows = names.map((n) => [
      `"${n.id}"`,
      `"${(n.child_name || '').replace(/"/g, '""')}"`,
      `"${n.child_age}"`,
      `"${n.status}"`,
      `"${n.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=poochandi_complaint_names_${Date.now()}.csv`,
      },
    });
  }

  return NextResponse.json({ names });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(',');
    const deleteStmt = db.prepare(`DELETE FROM complaint_names WHERE id IN (${placeholders})`);
    deleteStmt.run(...ids);

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
