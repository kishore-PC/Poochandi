import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      parentName,
      childName,
      ageGrade,
      behavior,
      city,
      specialInstructions,
      consent,
    } = body;

    // Strict Validation
    if (!parentName || !parentName.trim()) {
      return NextResponse.json({ error: 'Parent name is required.' }, { status: 400 });
    }
    if (!childName || !childName.trim()) {
      return NextResponse.json({ error: 'Child name is required.' }, { status: 400 });
    }
    if (!ageGrade) {
      return NextResponse.json({ error: 'Please select an age or grade.' }, { status: 400 });
    }
    if (!behavior) {
      return NextResponse.json({ error: 'Please choose a behavior to encourage.' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json(
        { error: 'Parental / guardian consent is mandatory before submitting.' },
        { status: 400 }
      );
    }

    // Generate unique Request ID: e.g. PCH-2026-X8K9
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const requestId = `PCH-2026-${randomSuffix}`;

    // Insert into SQLite database securely
    const insertStmt = db.prepare(`
      INSERT INTO child_requests (
        id, parent_name, child_name, nickname, age_grade, behavior, city, special_instructions, consent, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `);

    insertStmt.run(
      requestId,
      parentName.trim(),
      childName.trim(),
      body.nickname ? body.nickname.trim() : null,
      ageGrade,
      behavior,
      city ? city.trim() : null,
      specialInstructions ? specialInstructions.trim() : null,
      1
    );

    return NextResponse.json({
      success: true,
      requestId,
      childName: childName.trim(),
      behavior,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
