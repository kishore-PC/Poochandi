import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb, queryOne } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await initDb();
  const row = await queryOne<{ value: string }>(
    'SELECT value FROM site_settings WHERE key = ?',
    ['name_entry_status']
  );
  const status = row?.value === 'stopped' ? 'stopped' : 'active';
  return NextResponse.json({ status });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const body = await req.json().catch(() => ({}));
    const status = body?.status === 'stopped' ? 'stopped' : body?.status === 'active' ? 'active' : null;
    if (!status) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    await execute(
      'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
      ['name_entry_status', status]
    );
    return NextResponse.json({ success: true, status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update name entry status' }, { status: 500 });
  }
}
