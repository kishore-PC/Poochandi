import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';
import { execute, initDb } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await initDb();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = String(formData.get('type') || '');
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    let publicUrl = '';
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const ext = path.extname(file.name) || '.png';
      const blob = await put(`poochandi/${type || 'upload'}-${Date.now()}${ext}`, file, {
        access: 'public',
        addRandomSuffix: true,
      });
      publicUrl = blob.url;
    } else if (!process.env.VERCEL) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || '.png';
      const filename = `${type}_${Date.now()}${ext}`;
      const uploadPath = path.join(process.cwd(), 'public', 'images', filename);
      await writeFile(uploadPath, buffer);
      publicUrl = `/images/${filename}`;
    } else {
      return NextResponse.json({ error: 'File upload is not configured on Vercel. Add Vercel Blob (BLOB_READ_WRITE_TOKEN) or paste an image URL in Appearance settings.' }, { status: 400 });
    }

    if (type === 'avatar') {
      await execute(`INSERT INTO site_settings (key, value) VALUES ('character_hero_url', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [publicUrl]);
    } else if (type === 'logo') {
      await execute(`INSERT INTO site_settings (key, value) VALUES ('logo_url', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [publicUrl]);
    }
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
