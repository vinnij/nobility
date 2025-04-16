import { prisma } from "./db";

export async function generateSitemap() {
  // Fetch all page slugs from the database
  const pages = await prisma.pageMetadata.findMany();
  const baseUrl = process.env.NEXTAUTH_URL; // Replace with your actual base URL

  // If no pages are found, provide a default or empty sitemap
  if (pages.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }

  // Generate XML sitemap content
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
    <url>
      <loc>${baseUrl}/${page.slug}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>`).join('')}
</urlset>`;
  return sitemap;
}