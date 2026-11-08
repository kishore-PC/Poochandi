import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' | 'logo' | 'thumbnail'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const filename = `${type}_${Date.now()}${ext}`;
    const uploadPath = path.join(process.cwd(), 'public', 'images', filename);

    await writeFile(uploadPath, buffer);
    const publicUrl = `/images/${filename}`;

    // Update site setting accordingly
    if (type === 'avatar') {
      db.prepare(`INSERT INTO site_settings (key, value) VALUES ('character_hero_url', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(publicUrl);
    } else if (type === 'logo') {
      db.prepare(`INSERT INTO site_settings (key, value) VALUES ('logo_url', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(publicUrl);
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
