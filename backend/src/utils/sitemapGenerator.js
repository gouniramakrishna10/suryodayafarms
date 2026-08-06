import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSitemapContent() {
  const staticPages = [
    { url: 'https://suryodayafarms.com/', priority: '1.0', changefreq: 'daily' },
    { url: 'https://suryodayafarms.com/products', priority: '0.9', changefreq: 'daily' },
    { url: 'https://suryodayafarms.com/about', priority: '0.8', changefreq: 'weekly' },
    { url: 'https://suryodayafarms.com/faq', priority: '0.8', changefreq: 'weekly' },
    { url: 'https://suryodayafarms.com/contact', priority: '0.7', changefreq: 'monthly' },
    { url: 'https://suryodayafarms.com/become-a-partner', priority: '0.7', changefreq: 'monthly' },
    { url: 'https://suryodayafarms.com/privacy', priority: '0.5', changefreq: 'monthly' }
  ];

  // Fetch active categories from Database
  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    select: { slug: true, updatedAt: true }
  });

  // Fetch active products from Database (exclude draft/test items)
  const products = await prisma.product.findMany({
    where: {
      isVisible: true,
      NOT: [
        { slug: { contains: 'test' } },
        { name: { contains: 'Test' } }
      ]
    },
    select: { slug: true, updatedAt: true }
  });

  const todayStr = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static Pages
  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${todayStr}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. Categories
  categories.forEach(cat => {
    const lastmod = (cat.updatedAt || new Date()).toISOString().split('T')[0];
    xml += `  <url>\n`;
    xml += `    <loc>https://suryodayafarms.com/category/${cat.slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  // 3. Products
  products.forEach(prod => {
    const lastmod = (prod.updatedAt || new Date()).toISOString().split('T')[0];
    xml += `  <url>\n`;
    xml += `    <loc>https://suryodayafarms.com/products/${prod.slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  return {
    xml,
    staticCount: staticPages.length,
    categoryCount: categories.length,
    productCount: products.length,
    totalCount: staticPages.length + categories.length + products.length
  };
}

export async function generateAndSaveSitemapXML() {
  try {
    const { xml, staticCount, categoryCount, productCount, totalCount } = await generateSitemapContent();
    
    // Save to frontend/public/sitemap.xml if directory exists
    const publicSitemapPath = path.resolve(__dirname, '../../../frontend/public/sitemap.xml');
    if (fs.existsSync(path.dirname(publicSitemapPath))) {
      fs.writeFileSync(publicSitemapPath, xml, 'utf8');
      console.log(`[Sitemap Generator] Synced frontend/public/sitemap.xml - Total URLs: ${totalCount} (${staticCount} static, ${categoryCount} categories, ${productCount} products)`);
    }

    return { xml, staticCount, categoryCount, productCount, totalCount };
  } catch (err) {
    console.error('[Sitemap Generator] Error generating sitemap:', err);
    return null;
  }
}
