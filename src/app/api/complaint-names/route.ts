import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { childName, childAge, entryId: clientEntryId } = body;

    if (typeof childName !== 'string') {
      return NextResponse.json({ error: 'Maximum 13 characters. Commas, full stops and special characters are not allowed.' }, { status: 400 });
    }
    const trimmedName = childName.trim();
    if (!trimmedName) {
      return NextResponse.json({ error: 'Child name cannot be empty.' }, { status: 400 });
    }
    if (trimmedName.length > 13 || !/^[\p{L} ]+$/u.test(trimmedName)) {
      return NextResponse.json({ error: 'Maximum 13 characters. Commas, full stops and special characters are not allowed.' }, { status: 400 });
    }
    const ageNum = parseInt(childAge, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      return NextResponse.json({ error: 'Please enter a valid age between 1 and 18.' }, { status: 400 });
    }

    const safeClientId = typeof clientEntryId === 'string' && /^PCH-LIST-[A-Z0-9]{4,12}$/.test(clientEntryId) ? clientEntryId : null;
    const entryId = safeClientId || `PCH-LIST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await execute(`INSERT OR IGNORE INTO complaint_names (id, child_name, child_age, status) VALUES (?, ?, ?, 'ACTIVE')`, [entryId, trimmedName, ageNum]);
    return NextResponse.json({ success: true, entryId, childName: trimmedName, childAge: ageNum });
  } catch (error) {
    console.error('Complaint name submission error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const isConfig = msg.includes('Database not configured');
    return NextResponse.json({ error: isConfig ? msg : `Failed to record entry: ${msg}` }, { status: isConfig ? 503 : 500 });
  }
}
