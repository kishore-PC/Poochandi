import { NextRequest, NextResponse } from 'next/server';
import { execute, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { parentName, childName, ageGrade, behavior, city, specialInstructions, consent } = body;

    if (!parentName || !String(parentName).trim()) return NextResponse.json({ error: 'Parent name is required.' }, { status: 400 });
    if (!childName || !String(childName).trim()) return NextResponse.json({ error: 'Child name is required.' }, { status: 400 });
    if (!ageGrade) return NextResponse.json({ error: 'Please select an age or grade.' }, { status: 400 });
    if (!behavior) return NextResponse.json({ error: 'Please choose a behavior to encourage.' }, { status: 400 });
    if (!consent) return NextResponse.json({ error: 'Parental / guardian consent is mandatory before submitting.' }, { status: 400 });

    const requestId = `PCH-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await execute(
      `INSERT INTO child_requests (id, parent_name, child_name, nickname, age_grade, behavior, city, special_instructions, consent, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [requestId, String(parentName).trim(), String(childName).trim(), body.nickname ? String(body.nickname).trim() : null, ageGrade, behavior, city ? String(city).trim() : null, specialInstructions ? String(specialInstructions).trim() : null, 1]
    );

    return NextResponse.json({ success: true, requestId, childName: String(childName).trim(), behavior });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to process request. Please try again.' }, { status: 500 });
  }
}
