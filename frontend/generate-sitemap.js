import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { slugify } from './src/utils/slugify.js';

// Simple helper to parse .env file
function loadEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value.trim();
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

const isDummy = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-id') || supabaseUrl.includes('dummy');

const MOCK_DESIGNS = [
  { id: '1', title: 'Traditional Gold Zari Butti Motif', created_at: new Date().toISOString() },
  { id: '2', title: 'Royal Elephant Mandala Blouse Back', created_at: new Date().toISOString() },
  { id: '3', title: 'Peacock Border Lace Pattern', created_at: new Date().toISOString() },
  { id: '4', title: 'Abstract Geometry Sleeve Pattern', created_at: new Date().toISOString() },
  { id: '5', title: 'Classic Floral Pallu Border', created_at: new Date().toISOString() },
  { id: '6', title: 'Delicate Rose Vines neckline', created_at: new Date().toISOString() }
];

async function generateSitemap() {
  console.log('Generating sitemap...');
  let designs = [];

  if (isDummy) {
    console.log('Running in SANDBOX/MOCK mode. Using mock designs for sitemap generation.');
    designs = MOCK_DESIGNS;
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.from('designs').select('id, title, created_at');
      if (error) throw error;
      if (data && data.length > 0) {
        designs = data;
        console.log(`Fetched ${designs.length} designs from Supabase.`);
      } else {
        console.log('No designs found in Supabase. Using mock designs.');
        designs = MOCK_DESIGNS;
      }
    } catch (err) {
      console.warn('Supabase query failed. Falling back to mock designs for sitemap:', err.message);
      designs = MOCK_DESIGNS;
    }
  }

  const urls = [
    { loc: 'https://www.weavingdesigns.in/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://www.weavingdesigns.in/cart', priority: '0.3', changefreq: 'weekly' }
  ];

  designs.forEach(d => {
    const slug = slugify(d.title);
    urls.push({
      loc: `https://www.weavingdesigns.in/design/${d.id}/${slug}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
    });
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.resolve('public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xmlContent, 'utf8');
  console.log(`Sitemap written successfully to: ${outputPath}`);
}

generateSitemap().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
