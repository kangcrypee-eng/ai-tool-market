export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crypee-ai.vercel.app';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/settings/', '/my/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
