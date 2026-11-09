import { initDb } from './db';

export async function seedInitialData() {
  await initDb();
  return { success: true };
}
