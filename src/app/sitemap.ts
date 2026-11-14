import { MetadataRoute } from 'next';
import { initDb, queryAll } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://poochandi.in';
  const languages = ['en', 'ta'];
  const staticRoutes = ['', '/send-request', '/complaint-name-list', '/good-child-certificate', '/parenting-guides', '/about-poochandi', '/contact', '/privacy-policy', '/terms-of-service', '/disclaimer'];
  const routes: MetadataRoute.Sitemap = [];

  for (const lang of languages) {
    for (const route of staticRoutes) {
      routes.push({ url: `${baseUrl}/${lang}${route}`, lastModified: new Date(), changeFrequency: route === '' ? 'daily' : 'weekly', priority: route === '' ? 1.0 : 0.8 });
    }
  }

  try {
    await initDb();
    const articles = await queryAll<{ slug: string; updated_at: string }>('SELECT slug, updated_at FROM articles WHERE published = 1');
    for (const art of articles) {
      for (const lang of languages) {
        routes.push({ url: `${baseUrl}/${lang}/parenting-guides/${art.slug}`, lastModified: art.updated_at ? new Date(art.updated_at) : new Date(), changeFrequency: 'weekly', priority: 0.7 });
      }
    }
  } catch (e) {
    console.error('Sitemap article query error:', e);
  }
  return routes;
}
