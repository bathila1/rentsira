import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Use the environment variable, or fallback to localhost during dev
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/seller/dashboard/', 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}