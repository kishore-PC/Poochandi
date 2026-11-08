import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childName, childAge } = body;

    // Strict validation
    if (!childName || typeof childName !== 'string' || !childName.trim()) {
      return NextResponse.json({ error: 'Child name cannot be empty.' }, { status: 400 });
    }

    const ageNum = parseInt(childAge, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
      return NextResponse.json({ error: 'Please enter a valid age between 1 and 18.' }, { status: 400 });
    }

    // Generate unique entry ID
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const entryId = `PCH-LIST-${randomSuffix}`;

    // Secure database insert
    const insertStmt = db.prepare(`
      INSERT INTO complaint_names (id, child_name, child_age, status)
      VALUES (?, ?, ?, 'ACTIVE')
    `);

    insertStmt.run(entryId, childName.trim(), ageNum);

    return NextResponse.json({
      success: true,
      entryId,
      childName: childName.trim(),
      childAge: ageNum,
    });
  } catch (error) {
    console.error('Complaint name submission error:', error);
    return NextResponse.json(
      { error: 'Failed to record entry. Please try again.' },
      { status: 500 }
    );
  }
}
