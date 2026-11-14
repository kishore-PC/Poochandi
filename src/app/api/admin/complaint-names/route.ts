import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb, queryAll, queryOne } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

const AVAILABLE_STATUS_SQL = "(status IS NULL OR UPPER(status) IN ('ACTIVE','AVAILABLE'))";
const USED_STATUS_SQL = "UPPER(status) = 'USED'";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';
  const exportFormat = searchParams.get('export');
  const availability = searchParams.get('availability'); // 'available' | 'used' | null
  const withCounts = searchParams.get('counts') === '1';

  let query = 'SELECT * FROM complaint_names';
  const params: any[] = [];
  const where: string[] = [];
  if (availability === 'available') where.push(AVAILABLE_STATUS_SQL);
  if (availability === 'used') where.push(USED_STATUS_SQL);
  if (search) {
    where.push('(child_name LIKE ? OR id LIKE ?)');
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }
  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += sort === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';
  const names = await queryAll<any>(query, params);

  if (exportFormat === 'csv') {
    const headers = ['Entry ID', 'Child Name', 'Child Age', 'Status', 'Created At'];
    const rows = names.map((n) => [n.id,n.child_name,n.child_age,n.status,n.created_at].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename=poochandi_complaint_names_${Date.now()}.csv` } });
  }

  if (withCounts) {
    const counts = await queryOne<{ total: number; available: number; used: number }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ${AVAILABLE_STATUS_SQL} THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN ${USED_STATUS_SQL} THEN 1 ELSE 0 END) as used
       FROM complaint_names`
    );
    return NextResponse.json({
      names,
      counts: {
        total: Number(counts?.total || 0),
        available: Number(counts?.available || 0),
        used: Number(counts?.used || 0),
      },
    });
  }

  return NextResponse.json({ names });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const body = await req.json();
    const ids: unknown = body?.markUsedIds ?? body?.ids;
    const action = body?.action;

    // Mark selected names as permanently USED (excluded from future selection) - server-side, concurrency-safe
    if (action === 'mark_used' || Array.isArray(body?.markUsedIds)) {
      if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
      const uniqueIds = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.trim()))).map(String);
      if (uniqueIds.length === 0) return NextResponse.json({ error: 'No valid IDs provided' }, { status: 400 });

      const placeholders = uniqueIds.map(() => '?').join(',');
      // Only mark records that are currently available (not already USED) to prevent double-use in concurrent sessions
      const result: any = await execute(
        `UPDATE complaint_names
         SET status = 'USED', used_at = COALESCE(used_at, datetime('now'))
         WHERE id IN (${placeholders}) AND ${AVAILABLE_STATUS_SQL}`,
        uniqueIds
      );
      const marked = Number(result?.rowsAffected ?? result?.changes ?? 0);
      const counts = await queryOne<{ total: number; available: number; used: number }>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ${AVAILABLE_STATUS_SQL} THEN 1 ELSE 0 END) as available,
          SUM(CASE WHEN ${USED_STATUS_SQL} THEN 1 ELSE 0 END) as used
         FROM complaint_names`
      );
      return NextResponse.json({
        success: true,
        requested: uniqueIds.length,
        marked,
        counts: {
          total: Number(counts?.total || 0),
          available: Number(counts?.available || 0),
          used: Number(counts?.used || 0),
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Complaint names PATCH error:', error);
    return NextResponse.json({ error: 'Server error. No names were removed.' }, { status: 500 });
  }
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
