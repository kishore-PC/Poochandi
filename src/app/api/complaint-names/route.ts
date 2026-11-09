import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { childName, childAge } = body;

    if (!childName || typeof childName !== 'string' || !childName.trim()) {
      return NextResponse.json({ error: 'Child name cannot be empty.' }, { status: 400 });
    }
    const ageNum = parseInt(childAge, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      return NextResponse.json({ error: 'Please enter a valid age between 1 and 18.' }, { status: 400 });
    }

    const entryId = `PCH-LIST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await execute(`INSERT INTO complaint_names (id, child_name, child_age, status) VALUES (?, ?, ?, 'ACTIVE')`, [entryId, childName.trim(), ageNum]);
    return NextResponse.json({ success: true, entryId, childName: childName.trim(), childAge: ageNum });
  } catch (error) {
    console.error('Complaint name submission error:', error);
    return NextResponse.json({ error: 'Failed to record entry. Please try again.' }, { status: 500 });
  }
}
