import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = 'https://elrizonasiya.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/tg/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
