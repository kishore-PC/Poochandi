import { NextRequest, NextResponse } from 'next/server';
import { initDb, queryOne } from '@/lib/db';
import { comparePassword, signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });

    const user = await queryOne<{ id: string; username: string; password_hash: string }>('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const token = signAdminToken({ id: user.id, username: user.username });
    const response = NextResponse.json({ success: true });
    response.cookies.set('poochandi_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
