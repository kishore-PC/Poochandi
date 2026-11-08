import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  const requests = db.prepare(query).all(...params) as any[];

  // Support CSV Export
  if (exportFormat === 'csv') {
    const headers = [
      'Request ID',
      'Parent Name',
      'Child Name',
      'Nickname',
      'Age/Grade',
      'Behavior',
      'City',
      'Special Instructions',
      'Status',
      'Created At',
    ];

    const rows = requests.map((r) => [
      `"${r.id}"`,
      `"${(r.parent_name || '').replace(/"/g, '""')}"`,
      `"${(r.child_name || '').replace(/"/g, '""')}"`,
      `"${(r.nickname || '').replace(/"/g, '""')}"`,
      `"${(r.age_grade || '').replace(/"/g, '""')}"`,
      `"${(r.behavior || '').replace(/"/g, '""')}"`,
      `"${(r.city || '').replace(/"/g, '""')}"`,
      `"${(r.special_instructions || '').replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=poochandi_child_requests_${Date.now()}.csv`,
      },
    });
  }

  return NextResponse.json({ requests });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(',');
    const deleteStmt = db.prepare(`DELETE FROM child_requests WHERE id IN (${placeholders})`);
    deleteStmt.run(...ids);

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
