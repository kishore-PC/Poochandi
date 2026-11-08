import { MetadataRoute } from 'next';
import db from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://poochandi.in';
  const languages = ['en', 'ta'];

  // Static routes
  const staticRoutes = [
    '',
    '/send-request',
    '/parenting-guides',
    '/about-poochandi',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/disclaimer',
  ];

  const routes: MetadataRoute.Sitemap = [];

  for (const lang of languages) {
    for (const route of staticRoutes) {
      routes.push({
        url: `${baseUrl}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  // Articles
  try {
    const articles = db.prepare('SELECT slug, updated_at FROM articles WHERE published = 1').all() as { slug: string; updated_at: string }[];
    for (const art of articles) {
      for (const lang of languages) {
        routes.push({
          url: `${baseUrl}/${lang}/parenting-guides/${art.slug}`,
          lastModified: new Date(art.updated_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch (e) {
    console.error('Sitemap article query error:', e);
  }

  return routes;
}
