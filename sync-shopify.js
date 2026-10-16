#!/usr/bin/env node
/**
 * Sync Shopify Products → shopify-products.js
 * 
 * Fetches all products from the "SB Ugly Sweater" collection in Shopify
 * and regenerates the shopify-products.js data file used by the UglyNavySweater API.
 * 
 * Usage: node sync-shopify.js
 * 
 * Requirements: SHOPIFY_ADMIN_TOKEN environment variable (or hardcoded below)
 * 
 * After running, restart the API:  pm2 restart ugly-navy-api
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// === CONFIG ===
const SHOP = 'z4huee-wa.myshopify.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || '';
const COLLECTION_ID = 499207209272;
const API_VERSION = '2024-07';
const OUTPUT_FILE = path.join(__dirname, 'backend', 'shopify-products.js');
// ==============

function apiGet(urlPath) {
  return new Promise((resolve, reject) => {
    const url = urlPath.startsWith('http') ? urlPath : `https://${SHOP}/admin/api/${API_VERSION}/${urlPath}`;
    const req = https.request(url, {
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const link = res.headers.link || '';
          resolve({ data: json, link });
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('Request timeout')));
    req.end();
  });
}

function parseNextLink(linkHeader) {
  if (!linkHeader) return null;
  const parts = linkHeader.split(',');
  for (const part of parts) {
    if (part.includes('rel="next"')) {
      const match = part.match(/<([^>]+)>/);
      return match ? match[1] : null;
    }
  }
  return null;
}

function getCommunity(name) {
  const n = name.toLowerCase();
  if (['submarine', 'sub', 'silent night', 'ohio', 'los angeles', 'puller', 'emory s. land'].some(x => n.includes(x)))
    return ['sub', 'Silent Service'];
  if (['carrier', 'nimitz', 'ford', 'aviation', 'aircraft'].some(x => n.includes(x)))
    return ['aviation', 'Naval Aviation'];
  if (['seabee', 'construction', 'we build'].some(x => n.includes(x)))
    return ['seabees', 'Seabees'];
  if (['chief', 'goat', 'anchor', 'khaki', 'mess'].some(x => n.includes(x)))
    return ['chiefs', 'Chiefs Mess'];
  if (['amphib', 'wasp', 'san antonio', 'whidbey', 'blue ridge', 'gator', 'lpd', 'landing'].some(x => n.includes(x)))
    return ['amphib', 'Amphibious'];
  if (['veteran', 'family', 'spouse'].some(x => n.includes(x)))
    return ['veteran', 'Veterans & Navy Families'];
  return ['surface', 'Surface Fleet'];
}

function getShipClass(name) {
  const n = name.toLowerCase();
  const classes = ['america','arleigh burke','blue ridge','esb','freedom','gerald r. ford',
    'harpers ferry','independence','nimitz','san antonio','ticonderoga','wasp','whidbey island',
    'zumwalt','avenger','emory s. land','lewis b. puller','los angeles','ohio'];
  for (const c of classes) {
    if (n.includes(c)) return c.replace(/\b\w/g, l => l.toUpperCase());
  }
  return '';
}

function getProductType(name) {
  const n = name.toLowerCase();
  if (n.includes('full-print') || n.includes('sublimation') || n.includes('full print')) return 'full-print';
  if (n.includes('sweatshirt')) return 'sweatshirt';
  if (n.includes('knit') && n.includes('sweater')) {
    if (n.includes('sweater b')) return 'knit-b';
    if (n.includes('sweater c')) return 'knit-c';
    if (n.includes('sweater d')) return 'knit-d';
    return 'knit-a';
  }
  if (n.includes('ugly sweater') || n.includes('christmas')) return 'ugly-sweater';
  return 'knit-a';
}

function getVariantLabel(pt) {
  return {
    'knit-a': 'Knit Pattern A', 'knit-b': 'Knit Pattern B',
    'knit-c': 'Knit Pattern C', 'knit-d': 'Knit Pattern D',
    'sweatshirt': 'Unisex Sweatshirt',
    'full-print': 'Full-Print Sublimation',
    'ugly-sweater': 'Ugly Sweater',
  }[pt] || 'Sweater';
}

async function main() {
  console.log('=== Shopify Product Sync ===');
  console.log(`Store: ${SHOP}`);
  console.log(`Collection: SB Ugly Sweater (${COLLECTION_ID})`);
  console.log('');

  // Step 1: Get all product IDs from collection
  console.log('Step 1: Fetching collection products...');
  let url = `collections/${COLLECTION_ID}/products.json?limit=250`;
  let collectionProducts = [];
  while (url) {
    const { data, link } = await apiGet(url);
    const products = data.products || [];
    collectionProducts.push(...products);
    console.log(`  Got ${products.length} products (total: ${collectionProducts.length})`);
    url = parseNextLink(link);
  }

  // Deduplicate and filter
  const seen = new Set();
  const toFetch = [];
  for (const p of collectionProducts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const tags = p.tags || '';
    if (tags.includes('SB-Ugly Sweater') || tags.includes('SB Sweatshirts')) {
      toFetch.push(p);
    }
  }
  console.log(`\nProducts to include (SB-Ugly Sweater or SB Sweatshirts tag): ${toFetch.length}`);

  // Step 2: Fetch full product data
  console.log('\nStep 2: Fetching full product data...');
  let fullProducts = [];
  for (let i = 0; i < toFetch.length; i += 50) {
    const batch = toFetch.slice(i, i + 50);
    const ids = batch.map(p => p.id).join(',');
    const { data } = await apiGet(`products.json?ids=${ids}&limit=250`);
    fullProducts.push(...(data.products || []));
    console.log(`  Batch ${Math.floor(i/50)+1}: ${data.products?.length || 0} products`);
  }

  // Deduplicate
  const seen2 = new Set();
  const unique = [];
  for (const p of fullProducts) {
    if (!seen2.has(p.id)) {
      seen2.add(p.id);
      unique.push(p);
    }
  }
  unique.sort((a, b) => a.id - b.id);
  console.log(`\nTotal unique products: ${unique.length}`);

  // Step 3: Generate JS file
  console.log('\nStep 3: Generating shopify-products.js...');
  const today = new Date().toISOString().split('T')[0];
  const lines = [
    `// Shopify Products — Auto-generated from Harvest Market Shopify store`,
    `// Collection: SB Ugly Sweater (ID: ${COLLECTION_ID}) + Tag: SB-Ugly Sweater`,
    `// Last synced: ${today}`,
    ``,
    `const shopifyProducts = [`,
  ];

  unique.forEach((p, idx) => {
    const id = 101 + idx;
    const name = p.title;
    const handle = p.handle;
    const sid = p.id;
    const variants = p.variants || [];
    const sizes = variants.map(v => v.title).filter(Boolean);
    const price = variants.length ? parseFloat(variants[0].price) : 0.0;
    const images = (p.images || []).map(img => img.src).filter(Boolean);
    const primaryImage = images[0] || '';
    const bodyHtml = p.body_html || '';
    const desc = bodyHtml.replace(/<[^>]+>/g, '').trim().substring(0, 300);
    const [community, commLabel] = getCommunity(name);
    const shipClass = getShipClass(name);
    const pt = getProductType(name);
    const vlabel = getVariantLabel(pt);
    const tags = (p.tags || '').replace(/'/g, "\\'");
    const vendor = (p.vendor || 'Harvest Market').replace(/'/g, "\\'");
    const featured = idx < 5;
    const stock = 49995;
    const rating = Math.round((4.0 + (idx % 10) / 10.0) * 10) / 10;
    const reviews = (idx % 30) + 3;
    const status = p.status || 'active';

    const variantsJson = JSON.stringify(variants.map(v => ({
      id: String(v.id), title: v.title || '',
      price: v.price || '', sku: v.sku || '',
      available: v.available || false,
      option1: v.option1 || null, option2: v.option2 || null, option3: v.option3 || null
    })));

    lines.push(`  {`);
    lines.push(`    id: ${id}, shopifyId: '${sid}',`);
    lines.push(`    slug: '${handle}', name: ${JSON.stringify(name)},`);
    lines.push(`    community: '${community}', commLabel: '${commLabel}',`);
    lines.push(`    shipClass: '${shipClass}', productType: '${pt}',`);
    lines.push(`    variantLabel: '${vlabel}',`);
    lines.push(`    price: ${price},`);
    lines.push(`    sizes: ${JSON.stringify(sizes)},`);
    lines.push(`    colors: ${JSON.stringify(sizes)},`);
    lines.push(`    images: ${JSON.stringify(images)},`);
    lines.push(`    primaryImage: '${primaryImage}',`);
    lines.push(`    desc: ${JSON.stringify(desc)},`);
    lines.push(`    featured: ${featured},`);
    lines.push(`    stock: ${stock}, rating: ${rating}, reviews: ${reviews},`);
    lines.push(`    tags: '${tags}', vendor: '${vendor}',`);
    lines.push(`    shopifyHandle: '${handle}',`);
    lines.push(`    shopifyUrl: 'https://harvestmarket.coffee/products/${handle}',`);
    lines.push(`    variantCount: ${variants.length},`);
    lines.push(`    status: '${status}',`);
    lines.push(`    variants: ${variantsJson}`);
    lines.push(`  },`);
  });

  // Remove trailing comma
  if (lines[lines.length - 1] === '},') {
    lines[lines.length - 1] = '}';
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`module.exports = shopifyProducts;`);

  const js = lines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, js);
  console.log(`\nWritten: ${OUTPUT_FILE} (${js.length} bytes, ${unique.length} products)`);
  console.log('\n=== DONE ===');
  console.log('Restart the API: pm2 restart ugly-navy-api');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});