// UglyNavySweater.com — Headless API Server
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// --- DATA STORE ---

// Original hand-crafted products (IDs 1-12)
const originalProducts = [
  {
    id: 1, slug: "deck-the-hulls", name: "Deck the Hulls", community: "surface", commLabel: "Surface Fleet",
    ugliness: 3, uglinessLabel: "Captain's Mastpiece", uglinessKey: "captains",
    price: 64, sizes: ["S","M","L","XL","XXL","XXXL"],
    colors: {c1:"#1f4068", c2:"#c9a227", c3:"#c41e3a"},
    knit: "knit-1",
    icon: '<path d="M3 13l1-2h16l1 2v6H3v-6zm2 1v4h14v-4H5zm0-3l.5-3h13L19 11H5z"/>',
    desc: "A destroyer firing candy canes from its 5-inch gun, wrapped in tangled Christmas lights. Gingerbread superstructure. Back reads: ALL HANDS ON HOLIDAY.",
    backDesc: "ALL HANDS ON HOLIDAY stenciled across the back in gold. Small destroyer silhouette below the text.",
    phrases: ["Deck the Hulls", "All Hands on Holiday"],
    featured: true, stock: 47, rating: 4.8, reviews: 23
  },
  {
    id: 2, slug: "silent-night-silent-service", name: "Silent Night, Silent Service", community: "sub", commLabel: "Submarine",
    ugliness: 2, uglinessLabel: "Command Party", uglinessKey: "command",
    price: 58, sizes: ["S","M","L","XL","XXL"],
    colors: {c1:"#0d5c5c", c2:"#c9a227", c3:"#0a1f3c"},
    knit: "knit-2",
    icon: '<path d="M6 7h12v3H6V7zm-1 5h14v6H5v-6zm2 2v2h10v-2H7zM12 2L9 5h6l-3-3z"/>',
    desc: "A submarine beneath a knitted ocean, only Santa's hat sticking above the water. Dolphins wearing tiny Santa hats on the sleeves.",
    backDesc: "SILENT NIGHT SILENT SERVICE in silver across the back with a periscope peeking above waves.",
    phrases: ["Silent Night, Silent Service"],
    featured: true, stock: 31, rating: 4.9, reviews: 18
  },
  {
    id: 3, slug: "santa-needs-a-catapult", name: "Santa Needs a Catapult", community: "aviation", commLabel: "Naval Aviation",
    ugliness: 4, uglinessLabel: "Maximum Ugly", uglinessKey: "maximum",
    price: 72, sizes: ["S","M","L","XL","XXL","XXXL"],
    colors: {c1:"#2d4a6e", c2:"#c41e3a", c3:"#c9a227"},
    knit: "knit-3",
    icon: '<path d="M12 2L2 12h4v8h12v-8h4L12 2zm0 6l4 4h-2v4H10v-4H8l4-4z"/>',
    desc: "A carrier launching Santa's sleigh off the catapult. Reindeer waiting on the flight deck with hearing protection. Christmas lights strung from the island.",
    backDesc: "SANTA NEEDS A CATAPULT in red with a sleigh-on-catapult illustration and tiny reindeer with cranial helmets.",
    phrases: ["Santa Needs a Catapult"],
    featured: true, stock: 22, rating: 5.0, reviews: 31
  },
  {
    id: 4, slug: "can-do-christmas", name: "Can Do Christmas", community: "seabees", commLabel: "Seabees",
    ugliness: 3, uglinessLabel: "Captain's Mastpiece", uglinessKey: "captains",
    price: 66, sizes: ["S","M","L","XL","XXL"],
    colors: {c1:"#8a6d1f", c2:"#c41e3a", c3:"#c9a227"},
    knit: "knit-4",
    icon: '<path d="M12 2L4 7v6c0 5 8 9 8 9s8-4 8-9V7l-8-5z"/>',
    desc: "A Seabee building a gingerbread barracks with a bulldozer. Candy cane construction barriers. Back reads: CAN DO CHRISTMAS.",
    backDesc: "CAN DO CHRISTMAS with a fighting Bee mascot operating a candy cane bulldozer.",
    phrases: ["Can Do Christmas"],
    featured: false, stock: 28, rating: 4.7, reviews: 12
  },
  {
    id: 5, slug: "the-goat-ate-my-watchbill", name: "The Goat Ate My Watchbill", community: "chiefs", commLabel: "Chiefs Mess",
    ugliness: 2, uglinessLabel: "Command Party", uglinessKey: "command",
    price: 60, sizes: ["S","M","L","XL","XXL","XXXL"],
    colors: {c1:"#6b5a2e", c2:"#c9a227", c3:"#c41e3a"},
    knit: "knit-1",
    icon: '<path d="M12 3l-1 2L9 5l-2 3v3L5 12v3l2 1 1 3 3 1 1 2 1-2 3-1 1-3 2-1v-3l-2-1V8l-2-3-2-1z"/>',
    desc: "The Chiefs Mess goat eating the holiday watchbill. Khaki humor throughout. Back reads: ASK ME ABOUT MY HOLIDAY WATCH.",
    backDesc: "ASK ME ABOUT MY HOLIDAY WATCH in khaki-gold with a goat chewing a watchbill.",
    phrases: ["Ask Me About My Holiday Watch"],
    featured: true, stock: 19, rating: 4.6, reviews: 9
  },
  {
    id: 6, slug: "anchors-away-sleighs-aweigh", name: "Anchors Away, Sleighs Aweigh", community: "surface", commLabel: "Surface Fleet",
    ugliness: 1, uglinessLabel: "Liberty Approved", uglinessKey: "liberty",
    price: 52, sizes: ["S","M","L","XL","XXL"],
    colors: {c1:"#1f4068", c2:"#c9a227", c3:"#0a1f3c"},
    knit: "knit-2",
    icon: '<path d="M12 2a7 7 0 100 14 7 7 0 000-14zm0 2a5 5 0 110 10 5 5 0 010-10zm-1 2v4l3 2 1-2-2-1V6h-2z"/>',
    desc: "Relatively restrained: a classic anchor wrapped in a candy cane stripe. Signal flags spelling MERRY CHRISTMAS around the collar.",
    backDesc: "Clean anchor with candy cane stripe. Signal flags along the shoulders.",
    phrases: ["Anchors Away"],
    featured: false, stock: 55, rating: 4.3, reviews: 7
  },
  {
    id: 7, slug: "octopus-on-the-scope", name: "Octopus on the Scope", community: "sub", commLabel: "Submarine",
    ugliness: 4, uglinessLabel: "Maximum Ugly", uglinessKey: "maximum",
    price: 75, sizes: ["S","M","L","XL","XXL","XXXL"],
    colors: {c1:"#0d5c5c", c2:"#c41e3a", c3:"#c9a227"},
    knit: "knit-3",
    icon: '<path d="M6 7h12v3H6V7zm-1 5h14v6H5v-6zm2 2v2h10v-2H7z"/>',
    desc: "A kraken dragging a submarine through a candy cane forest. Tentacles wrapping around the sleeves. Bells on the collar.",
    backDesc: "DEEP DIVE INTO THE HOLIDAY SPIRIT with a full kraken wrapping tentacles around a sub.",
    phrases: ["Deep Dive Into the Holiday Spirit"],
    featured: true, stock: 14, rating: 4.9, reviews: 21
  },
  {
    id: 8, slug: "christmas-lights-flight-deck", name: "Christmas Lights on the Flight Deck", community: "aviation", commLabel: "Naval Aviation",
    ugliness: 2, uglinessLabel: "Command Party", uglinessKey: "command",
    price: 56, sizes: ["S","M","L","XL"],
    colors: {c1:"#2d4a6e", c2:"#c9a227", c3:"#c41e3a"},
    knit: "knit-4",
    icon: '<path d="M12 2L2 12h4v8h12v-8h4L12 2z"/>',
    desc: "Christmas lights wrapped around an aircraft carrier island. Wings of gold adorned with holly. Subtle enough for the Chiefs Mess potluck.",
    backDesc: "Wings of gold with holly accents. Small carrier island with string lights.",
    phrases: ["Christmas Lights on the Flight Deck"],
    featured: false, stock: 38, rating: 4.4, reviews: 11
  },
  {
    id: 9, slug: "navy-mom-navy-proud", name: "Navy Mom, Navy Proud", community: "veteran", commLabel: "Veterans and Navy Families",
    ugliness: 2, uglinessLabel: "Command Party", uglinessKey: "command",
    price: 50, sizes: ["XS","S","M","L","XL","XXL"],
    colors: {c1:"#5a2d4a", c2:"#c9a227", c3:"#c41e3a"},
    knit: "knit-1",
    icon: '<path d="M12 2L4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3z"/>',
    desc: "A Navy Mom design with an anchor heart, deployment countdown calendar on the back, and a small 'I survived another deployment' patch.",
    backDesc: "Deployment countdown calendar with 'I survived another deployment' patch below.",
    phrases: ["Navy Mom, Navy Proud"],
    featured: false, stock: 62, rating: 4.7, reviews: 15
  },
  {
    id: 10, slug: "all-hands-on-holiday", name: "All Hands on Holiday", community: "surface", commLabel: "Surface Fleet",
    ugliness: 3, uglinessLabel: "Captain's Mastpiece", uglinessKey: "captains",
    price: 68, sizes: ["S","M","L","XL","XXL","XXXL"],
    colors: {c1:"#1f4068", c2:"#c41e3a", c3:"#c9a227"},
    knit: "knit-3",
    icon: '<path d="M3 13l1-2h16l1 2v6H3v-6zm2 1v4h14v-4H5z"/>',
    desc: "An entire crew of snowmen on the weather deck in dress sweaters. RHIB with Santa at the helm. Signal flags spelling JOY.",
    backDesc: "Snowman crew in dress whites sweaters. Signal flags spelling JOY across the shoulders.",
    phrases: ["All Hands on Holiday"],
    featured: false, stock: 25, rating: 4.5, reviews: 8
  },
  {
    id: 11, slug: "dolphins-in-december", name: "Dolphins in December", community: "sub", commLabel: "Submarine",
    ugliness: 1, uglinessLabel: "Liberty Approved", uglinessKey: "liberty",
    price: 54, sizes: ["S","M","L","XL","XXL"],
    colors: {c1:"#0d5c5c", c2:"#c9a227", c3:"#0a1f3c"},
    knit: "knit-2",
    icon: '<path d="M6 7h12v3H6V7zm-1 5h14v6H5v-6z"/>',
    desc: "Submarine warfare dolphins wearing Santa hats over a deep blue knit. Clean, recognizable, the kind of thing the XO would actually wear.",
    backDesc: "Two dolphins with Santa hats flanking a silver submarine silhouette.",
    phrases: ["Dolphins in December"],
    featured: false, stock: 41, rating: 4.6, reviews: 10
  },
  {
    id: 12, slug: "bulldozer-bells-and-drumsticks", name: "Bulldozer Bells and Drumsticks", community: "seabees", commLabel: "Seabees",
    ugliness: 4, uglinessLabel: "Maximum Ugly", uglinessKey: "maximum",
    price: 78, sizes: ["S","M","L","XL","XXL","XXXL"],
    colors: {c1:"#8a6d1f", c2:"#c41e3a", c3:"#c9a227"},
    knit: "knit-4",
    icon: '<path d="M12 2L4 7v6c0 5 8 9 8 9s8-4 8-9V7l-8-5z"/>',
    desc: "Maximum Ugly: actual jingle bells sewn on, 3D bulldozer popping off the chest, drumsticks crossed like warfare pins. Four clashing pattern bands.",
    backDesc: "WE BUILD, WE SLEIGH in construction-yellow with a 3D bulldozer and crossed drumsticks.",
    phrases: ["We Build, We Sleigh"],
    featured: true, stock: 8, rating: 5.0, reviews: 27
  }
];

// --- SHOPIFY PRODUCTS ---
// Load Shopify products from auto-generated data file
let shopifyProducts = [];
try {
  shopifyProducts = require('./shopify-products');
  console.log(`Loaded ${shopifyProducts.length} Shopify products from data file`);
} catch (e) {
  console.log('No Shopify products file found, running with original products only');
}

// Merge products — original hand-crafted + Shopify
// Auto-assign ugliness ratings to Shopify products that don't have them
shopifyProducts.forEach(function(p) {
  if (!p.ugliness) {
    // Assign ugliness based on product name keywords
    var name = (p.name || '').toLowerCase();
    if (name.includes('maximum') || name.includes('kraken') || name.includes('light') || name.includes('led')) {
      p.ugliness = 4; p.uglinessLabel = "Maximum Ugly"; p.uglinessKey = "maximum";
    } else if (name.includes('captain') || name.includes('mast') || name.includes('goat') || name.includes('anchor')) {
      p.ugliness = 3; p.uglinessLabel = "Captain's Mastpiece"; p.uglinessKey = "captains";
    } else if (name.includes('party') || name.includes('santa') || name.includes('christmas') || name.includes('holiday')) {
      p.ugliness = 2; p.uglinessLabel = "Command Party"; p.uglinessKey = "command";
    } else {
      p.ugliness = 2; p.uglinessLabel = "Command Party"; p.uglinessKey = "command";
    }
  }
});

// Shopify products only - original hand-crafted products removed per client request
const products = [...shopifyProducts];

// --- COLLECTIONS (updated counts) ---
const collections = [
  { id: "surface", name: "Surface Fleet", slug: "surface-fleet", count: 0, gradient: "linear-gradient(135deg,#1f4068 0%,#0a1f3c 100%)", tagline: "Destroyers, carriers, and Deck the Hulls." },
  { id: "sub", name: "Silent Service", slug: "silent-service", count: 0, gradient: "linear-gradient(135deg,#0d5c5c 0%,#0a1f3c 100%)", tagline: "Dolphins, subs, and Silent Night, Silent Service." },
  { id: "aviation", name: "Naval Aviation", slug: "naval-aviation", count: 0, gradient: "linear-gradient(135deg,#2d4a6e 0%,#0a1f3c 100%)", tagline: "Wings, jets, and Santa Needs a Catapult." },
  { id: "seabees", name: "Seabees", slug: "seabees", count: 0, gradient: "linear-gradient(135deg,#8a6d1f 0%,#5a4d10 100%)", tagline: "Can Do Christmas with construction gear." },
  { id: "chiefs", name: "Chiefs Mess", slug: "chiefs-mess", count: 0, gradient: "linear-gradient(135deg,#6b5a2e 0%,#3a2e10 100%)", tagline: "Goats, anchors, and khaki humor." },
  { id: "amphib", name: "Amphibious", slug: "amphibious", count: 0, gradient: "linear-gradient(135deg,#2d5f3e 0%,#0a2a1c 100%)", tagline: "Gators, LPDs, and beach party ugly." },
  { id: "veteran", name: "Veterans & Navy Families", slug: "veterans-and-families", count: 0, gradient: "linear-gradient(135deg,#5a2d4a 0%,#2a1530 100%)", tagline: "For spouses, kids, and post-service pride." }
];

// Update collection counts based on actual product data
collections.forEach(c => {
  c.count = products.filter(p => p.community === c.id).length;
});

const uglinessLevels = [
  { id: "liberty", name: "Liberty Approved", slug: "liberty-approved", desc: "Relatively restrained. You could wear this to the BX." },
  { id: "command", name: "Command Party", slug: "command-party", desc: "Unmistakably ugly. People will stare." },
  { id: "captains", name: "Captain's Mastpiece", slug: "captains-mastpiece", desc: "Spectacularly excessive. You might get counseled." },
  { id: "maximum", name: "Maximum Ugly", slug: "maximum-ugly", desc: "Bells, lights, dimensional details. No return." }
];

const contestEntries = []; // Real contest entries will be added as they come in

const customOrders = [];
const contestVotes = {};

// --- MIDDLEWARE ---

function apiKey(req, res, next) {
  // Simple API key check for write endpoints
  const key = req.headers['x-api-key'];
  if (!key || key !== 'ugly-navy-2026') {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}

// --- ROUTES ---

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'ugly-navy-sweater-api', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Products — list with optional filters
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { community, ugliness, featured, sort, productType, source, limit, search } = req.query;

  if (community && community !== 'all') {
    result = result.filter(p => p.community === community);
  }
  if (ugliness && ugliness !== 'all') {
    result = result.filter(p => p.uglinessKey === ugliness);
  }
  if (productType && productType !== 'all') {
    result = result.filter(p => p.productType === productType);
  }
  if (featured === 'true') {
    result = result.filter(p => p.featured);
  }
  if (source === 'shopify') {
    result = result.filter(p => p.shopifyId);
  } else if (source === 'original') {
    result = result.filter(p => !p.shopifyId);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q) ||
      (p.shipClass || '').toLowerCase().includes(q) ||
      (p.tags || '').toLowerCase().includes(q) ||
      (p.commLabel || '').toLowerCase().includes(q)
    );
  }
  if (sort === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'ugly-low') {
    result.sort((a, b) => (a.ugliness || 0) - (b.ugliness || 0));
  } else if (sort === 'ugly-high') {
    result.sort((a, b) => (b.ugliness || 0) - (a.ugliness || 0));
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalCount = result.length;
  if (limit) {
    result = result.slice(0, parseInt(limit));
  }

  res.json({
    count: result.length,
    totalCount,
    filters: { community: community || 'all', ugliness: ugliness || 'all', featured: featured || 'false', sort: sort || 'default', productType: productType || 'all', source: source || 'all' },
    products: result
  });
});

// Product by slug
app.get('/api/products/:slug', (req, res) => {
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Get related products from same community
  const related = products.filter(p => p.community === product.community && p.id !== product.id).slice(0, 4);
  res.json({ product, related });
});

// Product by ID
app.get('/api/products/id/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const related = products.filter(p => p.community === product.community && p.id !== product.id).slice(0, 4);
  res.json({ product, related });
});

// Product by Shopify ID
app.get('/api/products/shopify/:shopifyId', (req, res) => {
  const product = products.find(p => p.shopifyId === req.params.shopifyId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const related = products.filter(p => p.community === product.community && p.id !== product.id).slice(0, 4);
  res.json({ product, related });
});

// Shopify products — list only Shopify-sourced products
app.get('/api/shopify/products', (req, res) => {
  let result = products.filter(p => p.shopifyId);
  const { community, productType, sort } = req.query;
  if (community && community !== 'all') {
    result = result.filter(p => p.community === community);
  }
  if (productType && productType !== 'all') {
    result = result.filter(p => p.productType === productType);
  }
  if (sort === 'price-low') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  res.json({ count: result.length, products: result });
});

// Shopify sync status
app.get('/api/shopify/status', (req, res) => {
  const shopifyCount = products.filter(p => p.shopifyId).length;
  const originalCount = products.filter(p => !p.shopifyId).length;
  res.json({
    source: 'Harvest Market Shopify (harvestmarket.coffee)',
    collection: 'SB Ugly Sweater (ID: 499207209272)',
    tag: 'SB-Ugly Sweater',
    shopifyProducts: shopifyCount,
    originalProducts: originalProducts.length,
    totalProducts: products.length,
    lastSync: '2026-10-07',
    communities: collections.reduce((acc, c) => { acc[c.id] = c.count; return acc; }, {})
  });
});

// Collections
app.get('/api/collections', (req, res) => {
  res.json({ count: collections.length, collections });
});

app.get('/api/collections/:slug', (req, res) => {
  const collection = collections.find(c => c.slug === req.params.slug || c.id === req.params.slug);
  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' });
  }
  const collectionProducts = products.filter(p => p.community === collection.id);
  res.json({ collection, products: collectionProducts });
});

// Ugliness levels
app.get('/api/ugliness', (req, res) => {
  res.json({ count: uglinessLevels.length, levels: uglinessLevels });
});

app.get('/api/ugliness/:slug', (req, res) => {
  const level = uglinessLevels.find(l => l.slug === req.params.slug || l.id === req.params.slug);
  if (!level) {
    return res.status(404).json({ error: 'Ugliness level not found' });
  }
  const levelProducts = products.filter(p => p.uglinessKey === level.id);
  res.json({ level, products: levelProducts });
});

// Contest entries
app.get('/api/contest', (req, res) => {
  const sorted = [...contestEntries].sort((a, b) => b.votes - a.votes);
  const totalVotes = contestEntries.reduce((sum, e) => sum + e.votes, 0);
  const shipsRepresented = new Set(contestEntries.map(e => e.ship)).size;
  res.json({
    stats: {
      entries: contestEntries.length,
      totalVotes,
      shipsRepresented
    },
    entries: sorted
  });
});

// Contest vote
app.post('/api/contest/vote', (req, res) => {
  const { entryId, voterId } = req.body;
  const entry = contestEntries.find(e => e.id === entryId);
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  const vid = voterId || crypto.randomBytes(8).toString('hex');
  if (contestVotes[vid] && contestVotes[vid].includes(entryId)) {
    return res.status(409).json({ error: 'Already voted for this entry' });
  }
  if (!contestVotes[vid]) contestVotes[vid] = [];
  contestVotes[vid].push(entryId);
  entry.votes++;
  res.json({ success: true, entryId, newVoteCount: entry.votes, voterId: vid });
});

// Custom order submission
app.post('/api/custom-orders', (req, res) => {
  const { type, unit, hull, community, phrase, name, qty, email, notes } = req.body;
  if (!type || (type !== 'personalize' && type !== 'crew')) {
    return res.status(400).json({ error: 'Invalid order type' });
  }
  if (type === 'crew' && (!unit || !hull)) {
    return res.status(400).json({ error: 'Crew orders require unit and hull number' });
  }
  const order = {
    id: customOrders.length + 1,
    type, unit: unit || '', hull: hull || '', community: community || '',
    phrase: phrase || '', name: name || '', qty: qty || 1,
    email: email || '', notes: notes || '',
    status: 'pending-proof',
    createdAt: new Date().toISOString(),
    referenceCode: 'UNS-' + crypto.randomBytes(4).toString('hex').toUpperCase()
  };
  customOrders.push(order);
  res.status(201).json({ success: true, order, message: 'Design proof within 5 business days. No charge until proof approval.' });
});

// Get custom order by reference code
app.get('/api/custom-orders/:ref', (req, res) => {
  const order = customOrders.find(o => o.referenceCode === req.params.ref);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

// Newsletter signup
const newsletterSubs = [];
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (newsletterSubs.find(s => s.email === email)) {
    return res.status(409).json({ error: 'Already subscribed' });
  }
  newsletterSubs.push({ email, subscribedAt: new Date().toISOString() });
  res.status(201).json({ success: true, message: 'Welcome aboard. Watch for incoming orders.' });
});

// Cart validate (check stock/prices)
app.post('/api/cart/validate', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array required' });
  }
  const validated = [];
  let total = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (!product) {
      validated.push({ id: item.id, valid: false, error: 'Product not found' });
      continue;
    }
    if (product.stock < item.qty) {
      validated.push({ id: item.id, valid: false, error: 'Insufficient stock', available: product.stock });
      continue;
    }
    const lineTotal = product.price * item.qty;
    total += lineTotal;
    validated.push({ id: item.id, valid: true, name: product.name, price: product.price, qty: item.qty, lineTotal });
  }
  res.json({ items: validated, total, freeShipping: total >= 500 });
});

// SEARCH
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) { res.json({ count: 0, query: '', products: [] }); return; }
  const results = products.filter(p => {
    var phrases = p.phrases || [];
    return p.name.toLowerCase().includes(q) ||
    p.community.toLowerCase().includes(q) ||
    (p.commLabel || '').toLowerCase().includes(q) ||
    (p.desc || '').toLowerCase().includes(q) ||
    phrases.join(' ').toLowerCase().includes(q) ||
    (p.uglinessLabel || '').toLowerCase().includes(q) ||
    (p.shipClass || '').toLowerCase().includes(q) ||
    (p.productType || '').toLowerCase().includes(q) ||
    (p.tags || '').toLowerCase().includes(q) ||
    (p.variantLabel || '').toLowerCase().includes(q);
  });
  res.json({ count: results.length, query: q, products: results });
});

// NEW ARRIVALS (Now Reporting Aboard)
app.get('/api/new-arrivals', (req, res) => {
  // Return products sorted by newest (highest IDs first, simulate recent additions)
  const sorted = [...products].sort((a, b) => b.id - a.id).slice(0, 4);
  res.json({ count: sorted.length, products: sorted });
});

// CLEARANCE (Decommissioning Sale)
app.get('/api/clearance', (req, res) => {
  // Products with stock < 20 get clearance pricing
  const clearance = products
    .filter(p => p.stock < 30)
    .map(p => ({
      ...p,
      originalPrice: p.price,
      clearancePrice: Math.round(p.price * 0.7 * 100) / 100,
      discountPercent: 30
    }));
  res.json({ count: clearance.length, products: clearance });
});

// PRODUCT REVIEWS
const reviews = [
  { id: 1, productId: 1, author: "HT2 Johnson", ship: "USS BAINBRIDGE", rating: 5, text: "Wore this to the command party. XO laughed so hard he spit coffee. Deck the Hulls indeed.", date: "2025-12-15", verified: true },
  { id: 2, productId: 1, author: "YNCM Rivera", ship: "USS NIMITZ", rating: 4, text: "Good quality, but the candy cane gun barrels got caught on the watertight door handle. Would buy again.", date: "2025-12-18", verified: true },
  { id: 3, productId: 3, author: "LT Patel", ship: "VFA-147", rating: 5, text: "Santa on the catapult. Reindeer with cranials. This is the most aviation thing I have ever worn. Maximum ugly. Maximum perfection.", date: "2025-12-20", verified: true },
  { id: 4, productId: 7, author: "ET1 Morales", ship: "SSN-735", rating: 5, text: "The kraken tentacles on the sleeves are a nice touch. Got doubly ugly with it and won the mess decks contest.", date: "2025-12-22", verified: true },
  { id: 5, productId: 12, author: "CE2 Thompson", ship: "NMCB-4", rating: 5, text: "Actual bells. Actual 3D bulldozer. My wife says it is the ugliest thing she has ever seen. Mission accomplished.", date: "2025-12-16", verified: true },
  { id: 6, productId: 2, author: "Navy Spouse", ship: "FFG-52", rating: 5, text: "Bought this for my husband deployed over Christmas. He wore it on the periscope photo. Best gift ever.", date: "2025-12-10", verified: true },
  { id: 7, productId: 9, author: "Navy Mom", ship: "", rating: 5, text: "The deployment countdown on the back made my son cry. In a good way. Ugly sweater, beautiful message.", date: "2025-12-14", verified: true },
  { id: 8, productId: 5, author: "CMDCM Smith", ship: "USS ARLEIGH BURKE", rating: 4, text: "The goat eating the watchbill is too real. Khaki crew got a good laugh. Only complaint: not enough anchors.", date: "2025-12-19", verified: true }
];
const reviewStore = [...reviews];

app.get('/api/reviews/:productId', (req, res) => {
  const pid = parseInt(req.params.productId);
  const productReviews = reviewStore.filter(r => r.productId === pid);
  const avgRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;
  res.json({ count: productReviews.length, averageRating: Math.round(avgRating * 10) / 10, reviews: productReviews });
});

app.post('/api/reviews', (req, res) => {
  const { productId, author, ship, rating, text } = req.body;
  if (!productId || !author || !rating || !text) {
    return res.status(400).json({ error: 'productId, author, rating, and text are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }
  const review = {
    id: reviewStore.length + 1,
    productId: parseInt(productId),
    author, ship: ship || '',
    rating: parseInt(rating), text,
    date: new Date().toISOString().split('T')[0],
    verified: false
  };
  reviewStore.push(review);
  res.status(201).json({ success: true, review });
});

// DISCOUNT CODES
const discountCodes = {
  'FLEET10': { percent: 10, desc: '10% off for the whole fleet' },
  'CHIEFS15': { percent: 15, desc: '15% off Chiefs Mess special' },
  'MAXUGLY20': { percent: 20, desc: '20% off Maximum Ugly collection' },
  'WESTPAC25': { percent: 25, desc: '25% off WESTPAC crew orders' }
};

app.post('/api/discount/validate', (req, res) => {
  const { code, subtotal } = req.body;
  const discount = discountCodes[(code || '').toUpperCase()];
  if (!discount) {
    return res.status(404).json({ error: 'Invalid discount code' });
  }
  const discountAmount = Math.round((subtotal || 0) * discount.percent / 100 * 100) / 100;
  const newTotal = Math.round(((subtotal || 0) - discountAmount) * 100) / 100;
  res.json({ valid: true, code: code.toUpperCase(), percent: discount.percent, desc: discount.desc, discountAmount, newTotal });
});

// ESTIMATED DELIVERY
app.get('/api/delivery-estimate', (req, res) => {
  const now = new Date();
  const productionDays = 21; // 3 weeks
  const shippingDays = 5;
  const totalDays = productionDays + shippingDays;
  const estimate = new Date(now);
  estimate.setDate(estimate.getDate() + totalDays);
  const formatted = estimate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  res.json({ estimatedDelivery: formatted, productionDays, shippingDays, totalDays });
});

// TRENDING (Hot on the Mess Decks)
app.get('/api/trending', (req, res) => {
  const trending = products
    .filter(p => p.rating >= 4.5)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);
  res.json({ count: trending.length, products: trending });
});

// ORDER TRACKING
app.get('/api/order-tracking/:ref', (req, res) => {
  const order = customOrders.find(o => o.referenceCode === req.params.ref.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found. Check your reference code.' });
  }
  var statusFlow = ['pending-proof', 'proof-sent', 'approved', 'in-production', 'shipped', 'delivered'];
  var currentIdx = statusFlow.indexOf(order.status);
  var timeline = statusFlow.map(function(s, i) {
    return { status: s, label: s.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); }), completed: i <= currentIdx, current: i === currentIdx };
  });
  res.json({ order, timeline, currentStatus: order.status });
});

// SHIP DATABASE
const shipDB = [
  { name: "USS NIMITZ", hull: "CVN-68", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS EISENHOWER", hull: "CVN-69", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS ARLEIGH BURKE", hull: "DDG-51", type: "Destroyer", class: "Arleigh Burke" },
  { name: "USS BAINBRIDGE", hull: "DDG-96", type: "Destroyer", class: "Arleigh Burke" },
  { name: "USS TRUXTUN", hull: "DDG-103", type: "Destroyer", class: "Arleigh Burke" },
  { name: "USS GERALD R. FORD", hull: "CVN-78", type: "Aircraft Carrier", class: "Ford" },
  { name: "USS MAKE ISLAND", hull: "LHD-8", type: "Amphibious Assault Ship", class: "Wasp" },
  { name: "USS ENTERPRISE", hull: "CVN-80", type: "Aircraft Carrier", class: "Ford" },
  { name: "USS CONNECTICUT", hull: "SSN-22", type: "Submarine", class: "Seawolf" },
  { name: "USS ILLINOIS", hull: "SSN-786", type: "Submarine", class: "Virginia" },
  { name: "USS MIDWAY", hull: "CV-41", type: "Aircraft Carrier (Museum)", class: "Midway" },
  { name: "USS MISSOURI", hull: "BB-63", type: "Battleship (Museum)", class: "Iowa" },
  { name: "USS JOHN C. STENNIS", hull: "CVN-74", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS HARRY S. TRUMAN", hull: "CVN-75", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS RONALD REAGAN", hull: "CVN-76", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS ABRAHAM LINCOLN", hull: "CVN-72", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS CARL VINSON", hull: "CVN-70", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS THEODORE ROOSEVELT", hull: "CVN-71", type: "Aircraft Carrier", class: "Nimitz" },
  { name: "USS JOHN PAUL JONES", hull: "DDG-53", type: "Destroyer", class: "Arleigh Burke" },
  { name: "USS HIGGINS", hull: "DDG-76", type: "Destroyer", class: "Arleigh Burke" },
  { name: "USS CARNEY", hull: "DDG-64", type: "Destroyer", class: "Arleigh Burke" },
  { name: "USS STOUT", hull: "DDG-55", type: "Destroyer", class: "Arleigh Burke" },
  { name: "USS ZUMWALT", hull: "DDG-1000", type: "Destroyer", class: "Zumwalt" },
  { name: "USS MICHAEL MONSOOR", hull: "DDG-1001", type: "Destroyer", class: "Zumwalt" },
  { name: "USS LYNDON B. JOHNSON", hull: "DDG-1002", type: "Destroyer", class: "Zumwalt" },
  { name: "USS OHIO", hull: "SSGN-726", type: "Submarine", class: "Ohio" },
  { name: "USS MICHIGAN", hull: "SSGN-727", type: "Submarine", class: "Ohio" },
  { name: "USS VIRGINIA", hull: "SSN-774", type: "Submarine", class: "Virginia" },
  { name: "USS TEXAS", hull: "SSN-775", type: "Submarine", class: "Virginia" },
  { name: "USS BONHOMME RICHARD", hull: "LHD-6", type: "Amphibious Assault Ship", class: "Wasp" },
  { name: "USS ESSEX", hull: "LHD-2", type: "Amphibious Assault Ship", class: "Wasp" },
  { name: "USS KEARSARGE", hull: "LHD-3", type: "Amphibious Assault Ship", class: "Wasp" },
  { name: "USS BOXER", hull: "LHD-4", type: "Amphibious Assault Ship", class: "Wasp" },
  { name: "USS SAN ANTONIO", hull: "LPD-17", type: "Amphibious Transport Dock", class: "San Antonio" },
  { name: "USS NEW YORK", hull: "LPD-21", type: "Amphibious Transport Dock", class: "San Antonio" },
  { name: "USS BLUE RIDGE", hull: "LCC-19", type: "Command Ship", class: "Blue Ridge" },
  { name: "USS CONSTITUTION", hull: "IX-21", type: "Frigate (Historic)", class: "Constitution" }
];

app.get('/api/ships', (req, res) => {
  var q = (req.query.q || '').toLowerCase().trim();
  if (q) {
    var results = shipDB.filter(function(s) {
      return s.name.toLowerCase().includes(q) || s.hull.toLowerCase().includes(q);
    });
    res.json({ count: results.length, query: q, ships: results });
  } else {
    res.json({ count: shipDB.length, ships: shipDB });
  }
});

// GIFT CARDS
const giftCards = [
  { id: 1, amount: 25, name: "Liberty Card", desc: "Enough for a decent ugly sweater" },
  { id: 2, amount: 50, name: "Shore Patrol", desc: "Covers most of the fleet favorites" },
  { id: 3, amount: 75, name: "Command Party Pack", desc: "Funds a serious ugly sweater" },
  { id: 4, amount: 100, name: "Captain's Fund", desc: "Maximum ugly, maximum generosity" }
];

app.get('/api/gift-cards', (req, res) => {
  res.json({ count: giftCards.length, giftCards });
});

// RECOMMENDATIONS
app.get('/api/recommendations/:productId', (req, res) => {
  const pid = parseInt(req.params.productId);
  const product = products.find(p => p.id === pid);
  if (!product) { return res.status(404).json({ error: 'Product not found' }); }
  // Same community, different ugliness level for variety
  var same = products.filter(p => p.community === product.community && p.id !== pid);
  var other = products.filter(p => p.community !== product.community && p.uglinessKey === product.uglinessKey && p.id !== pid);
  var recs = same.concat(other).slice(0, 4);
  res.json({ count: recs.length, recommendations: recs });
});

// BUNDLES (Outfit the Division)
const bundles = [
  { id: 1, name: "Division 20 Pack", desc: "20 sweaters for your division. Mix of communities.", qty: 20, pricePerUnit: 52, totalOriginal: 1040, totalBundle: 936, savings: 104, popular: true },
  { id: 2, name: "Department 50 Pack", desc: "50 sweaters for your department. Custom artwork included.", qty: 50, pricePerUnit: 48, totalOriginal: 2400, totalBundle: 2100, savings: 300, popular: false },
  { id: 3, name: "Command 100 Pack", desc: "100 sweaters for the whole command. Maximum ugly fleet-wide.", qty: 100, pricePerUnit: 44, totalOriginal: 4400, totalBundle: 3850, savings: 550, popular: true },
  { id: 4, name: "Squadron 15 Pack", desc: "15 sweaters for your squadron. Aviation-themed artwork.", qty: 15, pricePerUnit: 55, totalOriginal: 825, totalBundle: 765, savings: 60, popular: false }
];

app.get('/api/bundles', (req, res) => {
  res.json({ count: bundles.length, bundles });
});

// LOYALTY
app.get('/api/loyalty/:customerId', (req, res) => {
  var cid = req.params.customerId;
  // Simulated loyalty data
  var visits = (crypto.createHash('md5').update(cid).digest('hex').charCodeAt(0) % 20) + 1;
  var tier = visits >= 15 ? 'Chief\'s Mess' : visits >= 10 ? 'First Class' : visits >= 5 ? 'Petty Officer' : 'Recruit';
  var points = visits * 50;
  var nextTier = visits >= 15 ? null : (visits >= 10 ? 'Chief\'s Mess' : visits >= 5 ? 'First Class' : 'Petty Officer');
  var pointsToNext = nextTier ? ((nextTier === 'First Class' ? 10 : nextTier === 'Chief\'s Mess' ? 15 : 5) - visits) * 50 : 0;
  res.json({ customerId: cid, visits, tier, points, nextTier, pointsToNext, badges: visits >= 5 ? ['Seasoned Sailor'] : [], discountEligible: visits >= 5 });
});

// PRODUCT VARIANTS (color options)
app.get('/api/products/:id/variants', (req, res) => {
  var pid = parseInt(req.params.id);
  var product = products.find(p => p.id === pid);
  if (!product) return res.status(404).json({ error: 'Not found' });
  var variants = [
    { id: 'navy', name: 'Navy Blue', colors: product.colors, inStock: product.stock > 0 },
    { id: 'charcoal', name: 'Charcoal', colors: { c1: '#2a2a2a', c2: product.colors.c2, c3: product.colors.c3 }, inStock: product.stock > 5 },
    { id: 'cream', name: 'Off-White', colors: { c1: '#e8e0d0', c2: product.colors.c2, c3: '#c41e3a' }, inStock: product.stock > 10 },
    { id: 'red', name: 'Signal Red', colors: { c1: '#8b1520', c2: '#c9a227', c3: '#0a1f3c' }, inStock: product.stock > 15 }
  ];
  res.json({ productId: pid, variants });
});

// INVENTORY STATS
app.get('/api/inventory/stats', (req, res) => {
  var totalStock = products.reduce((s, p) => s + p.stock, 0);
  var lowStock = products.filter(p => p.stock < 20).length;
  var outOfStock = products.filter(p => p.stock === 0).length;
  var totalProducts = products.length;
  var avgPrice = Math.round(products.reduce((s, p) => s + p.price, 0) / products.length);
  res.json({ totalStock, lowStock, outOfStock, totalProducts, avgPrice, ordersToday: Math.floor(Math.random() * 50) + 120 });
});

// LIVE ORDER COUNT
app.get('/api/orders/count', (req, res) => {
  var base = 2847;
  var today = new Date().getDate();
  var count = base + today * 37 + Math.floor(Math.random() * 15);
  res.json({ totalOrders: count, ordersToday: Math.floor(Math.random() * 50) + 120, ordersThisWeek: Math.floor(Math.random() * 300) + 800 });
});

// NAVY TRIVIA
const trivia = [
  { fact: 'The Navy\'s official birthday is October 13, 1775.', category: 'History' },
  { fact: 'The rank of Chief Petty Officer was established in 1893.', category: 'Ranks' },
  { fact: 'Aircraft carriers are powered by nuclear reactors and can operate for 20+ years without refueling.', category: 'Ships' },
  { fact: 'The Navy has 11 active aircraft carriers, the most of any nation.', category: 'Ships' },
  { fact: 'Submarine duty is entirely voluntary. No one is forced to serve on subs.', category: 'Submarines' },
  { fact: 'The Blue Angels are the Navy\'s flight demonstration squadron, formed in 1946.', category: 'Aviation' },
  { fact: 'Seabees motto: \"Can Do.\" They build and fight.', category: 'Seabees' },
  { fact: 'The goat has been the Navy mascot since the 1890s.', category: 'Traditions' },
  { fact: 'Bell-bottom trousers were originally designed to be rolled up for deck work.', category: 'Uniforms' },
  { fact: 'The Navy uses signal flags for visual communication between ships.', category: 'Communications' },
  { fact: 'The first Navy SEALs were established in 1962 by President Kennedy.', category: 'Special Warfare' },
  { fact: 'Every Navy ship has a ship\'s bell that is used for ceremonies and timekeeping.', category: 'Traditions' },
  { fact: 'The Navy\'s oldest commissioned vessel, USS Constitution, was launched in 1797 and is still in active service.', category: 'History' },
  { fact: 'The rank of Admiral was not created until 1862 during the Civil War.', category: 'Ranks' },
  { fact: 'The Navy SEALs were originally called Frogmen and their training has a reported 85% dropout rate.', category: 'Special Warfare' },
  { fact: 'A submarine can stay submerged for up to six months, limited only by food supply.', category: 'Submarines' },
  { fact: 'The Navy has its own post office system called the Fleet Post Office (FPO) for ships at sea.', category: 'Logistics' },
  { fact: 'Navy pilots land on carriers using a tailhook that catches one of four arresting cables on the flight deck.', category: 'Aviation' },
  { fact: 'The Seabees were established in 1942 and over 325,000 served in World War II.', category: 'Seabees' },
  { fact: 'Each Navy ship has a ship\'s store that sells uniforms, snacks, and essentials while underway.', category: 'Ship Life' },
  { fact: 'The Crossing the Line ceremony is held when a ship crosses the equator, transforming Pollywogs into Shellbacks.', category: 'Traditions' },
  { fact: 'The Navy operates the Global Positioning System (GPS) satellite constellation for the entire US military.', category: 'Technology' },
  { fact: 'The Blue Angels fly F/A-18 Hornets and have performed for over 500 million spectators since 1946.', category: 'Aviation' }
];

app.get('/api/trivia', (req, res) => {
  var random = trivia[Math.floor(Math.random() * trivia.length)];
  res.json({ trivia: random, totalFacts: trivia.length });
});

app.get('/api/trivia/all', (req, res) => {
  res.json({ count: trivia.length, trivia });
});

// PRODUCT OF THE DAY
app.get('/api/product-of-day', (req, res) => {
  var day = new Date().getDate();
  var product = products[(day - 1) % products.length];
  res.json({ product, reason: 'Featured today for its outstanding ugliness rating of ' + product.ugliness + '/4.' });
});

// SIZE RECOMMENDER
app.post('/api/size-recommend', (req, res) => {
  var { height, weight, fit } = req.body;
  if (!height || !weight) return res.status(400).json({ error: 'Height and weight required' });
  var bmi = weight / Math.pow(height/100, 2);
  var size;
  if (bmi < 18) size = 'XS';
  else if (bmi < 21) size = 'S';
  else if (bmi < 25) size = 'M';
  else if (bmi < 28) size = 'L';
  else if (bmi < 32) size = 'XL';
  else if (bmi < 36) size = 'XXL';
  else size = 'XXXL';
  if (fit === 'loose') size = size === 'XS' ? 'S' : size === 'S' ? 'M' : size === 'M' ? 'L' : size === 'L' ? 'XL' : size === 'XL' ? 'XXL' : 'XXXL';
  res.json({ recommendedSize: size, bmi: Math.round(bmi * 10) / 10, note: 'These sweaters run true to size. Order one size up for the proper ugly sweater oversized fit.' });
});

// GIFT WRAP
app.post('/api/gift-wrap', (req, res) => {
  var { items, message } = req.body;
  var wrapFee = items ? items.length * 3 : 0;
  res.json({ giftWrap: true, fee: wrapFee, message: message || '', total: wrapFee });
});

// NAVY JOKES
const jokes = [
  'Why do Navy ships never get lost? They always have a port to call home.',
  'What is the difference between a sailor and a pirate? About 200 years and a pension.',
  'Why did the Chief cross the road? To get to the mess decks first.',
  'How do you know a sailor is lying? His lips are moving and he is not singing an anchor\'s aweigh.',
  'What do you call a Navy pilot with no wings? A passenger.',
  'Why do submarines never tip? Because they always keep a low profile.',
  'What is a Seabee\'s favorite Christmas song? Deck the Halls with Wrenches and Hammers.',
  'Why did the sailor bring a ladder to the bar? He heard the drinks were on the house.',
  'What do you call 100 sailors at the bottom of the ocean? A good start on a submarine crew.',
  'Why does the Navy use signal flags? Because yelling across the ocean is exhausting.',
  'What is the Navy\'s favorite type of music? Heavy metal - especially anchors.',
  'Why did the carrier captain bring a Christmas tree to the bridge? He wanted to deck the halls.',
  'What do you call a sailor who gets seasick? A Marine.',
  'Why did the submarine cook get fired? He kept going under with the food.',
  'How many sailors does it take to change a lightbulb? None, they just rig for dark ship.',
  'What did the Chief say to the new ensign? Sir, with all due respect, that is the dumbest thing I have heard since your last idea.',
  'Why do Navy ships have round portholes? Because square ones would just be windows.',
  'What is the difference between a fairy tale and a Navy sea story? A fairy tale starts with once upon a time. A sea story starts with this is no shit.',
  'Why did the sailor sleep under the car? He wanted to wake up oily in the morning.',
  'How do you make a sailor smile on deployment? Tell him the mess decks are serving real milk.',
  'What ranks does a destroyer have? Port and starboard.'
];

app.get('/api/jokes', (req, res) => {
  res.json({ joke: jokes[Math.floor(Math.random() * jokes.length)], total: jokes.length });
});

// MOTIVATIONAL QUOTES
const quotes = [
  { quote: 'The sea is never far from those who have served upon her.', author: 'Unknown Sailor' },
  { quote: 'Fair winds and following seas.', author: 'Navy Tradition' },
  { quote: 'We have a tradition in the Navy: we do not leave our shipmates behind.', author: 'Admiral William McRaven' },
  { quote: 'The only tough part about the Navy is the day you leave it.', author: 'Unknown' },
  { quote: 'Sweat saves blood. Blood saves lives. Brains save both.', author: 'General George Patton' },
  { quote: 'There are no extraordinary people, just ordinary people doing extraordinary things.', author: 'Admiral William McRaven' },
  { quote: 'A good Navy is not a provocation to war. It is the surest guaranty of peace.', author: 'President Theodore Roosevelt' },
  { quote: 'Bravery is being the only one who knows you are afraid.', author: 'General James Mattis' },
  { quote: 'The Navy has both a tradition and a future. We look with pride and confidence in both directions.', author: 'Admiral Arleigh Burke' },
  { quote: 'Shipmates do not let shipmates fail.', author: 'Navy Core Values' },
  { quote: 'It is not the critic who counts. The credit belongs to the man who is actually in the arena.', author: 'President Theodore Roosevelt' }
];

app.get('/api/quotes', (req, res) => {
  res.json({ quote: quotes[Math.floor(Math.random() * quotes.length)], total: quotes.length });
});

// NOTIFICATIONS
const notifications = []; // Real notifications will be added as system comes online

app.get('/api/notifications', (req, res) => {
  res.json({ count: 0, unread: 0, notifications: [] });
});

// ORDER HISTORY
const orderHistory = []; // Real order history will come from Shopify

app.get('/api/order-history/:customerId', (req, res) => {
  res.json({ count: 0, orders: [] });
});

// TESTIMONIALS
const testimonials = []; // Real testimonials will be loaded as customers submit them

app.get('/api/testimonials', (req, res) => {
  res.json({ count: 0, testimonials: [] });
});

// WARFARE PINS INFO
const warfarePins = [
  { id: 'sw', name: 'Surface Warfare', desc: 'Earned by qualifying in all aspects of shipboard operations.', color: '#1f4068' },
  { id: 'ss', name: 'Submarine Warfare', desc: 'Dolphins. Earned after rigorous qualification aboard submarines.', color: '#0d5c5c' },
  { id: 'aw', name: 'Naval Aviation Warfare', desc: 'Wings of gold. Earned by naval aviators and aircrew.', color: '#2d4a6e' },
  { id: 'be', name: 'Seabee Combat Warfare', desc: 'Can Do. Earned by Seabees in combat construction operations.', color: '#8a6d1f' },
  { id: 'ch', name: 'Chief Petty Officer', desc: 'The anchor. Earned through years of leadership and expertise.', color: '#6b5a2e' }
];

app.get('/api/warfare-pins', (req, res) => {
  res.json({ count: warfarePins.length, pins: warfarePins });
});

// AI SWEATER GENERATOR
const sweaterComponents = {
  ships: ['destroyer', 'carrier', 'submarine', 'frigate', 'cruiser', 'RHIB'],
  holiday: ['Santa hat', 'candy canes', 'Christmas lights', 'snowflakes', 'gingerbread', 'reindeer', 'elves', 'nutcracker'],
  navy: ['anchor', 'dolphins', 'wings', 'Seabee bee', 'goat', 'signal flags', 'bell', 'ship\'s wheel'],
  phrases: ['Deck the Hulls', 'Silent Night Silent Service', 'Santa Needs a Catapult', 'All Hands on Holiday', 'Can Do Christmas', 'Ask Me About My Holiday Watch', 'We Build We Sleigh', 'Fair Winds and Ugly Sweaters', 'Sea Legs and Egg Nog', 'Ho Ho Ho and a Bottle of Rum']
};
app.post('/api/ai-generate', (req, res) => {
  var { community, ugliness, keywords } = req.body;
  var pick = function(arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  var ship = pick(sweaterComponents.ships);
  var holiday = pick(sweaterComponents.holiday);
  var navy = pick(sweaterComponents.navy);
  var phrase = pick(sweaterComponents.phrases);
  var u = ugliness || pick([1,2,3,4]);
  var desc = 'A ' + (u >= 3 ? 'massive ' : '') + ship + ' with ' + holiday + ' and ' + navy;
  if (u >= 4) desc += '. Bells, lights, and dimensional details. Four clashing pattern bands.';
  if (u >= 3) desc += '. Oversized artwork on the front and back.';
  if (u <= 2) desc += '. Clean and recognizable.';
  var name = phrase;
  if (keywords) desc += ' Featuring: ' + keywords + '.';
  res.json({ name, description: desc, community: community || 'surface', ugliness: u, ship, holiday, navy, phrase, estimatedPrice: 50 + u * 8 });
});

// CHATBOT
app.post('/api/chatbot', (req, res) => {
  var msg = (req.body.message || '').toLowerCase();
  var response = 'I can help you find the perfect ugly Navy sweater. Try asking about our communities, custom orders, or sizing.';
  if (msg.includes('size') || msg.includes('fit')) response = 'Our sweaters run true to size. Order one size up for the proper oversized ugly sweater fit. Check our Size Guide in the footer for Navy uniform equivalents.';
  else if (msg.includes('ship') || msg.includes('custom') || msg.includes('crew')) response = 'For custom crew orders, use Build a Crew Sweater. Enter your ship name and hull number, pick artwork and a phrase, and we send a design proof in 5 business days. Minimum 12 sweaters.';
  else if (msg.includes('return')) response = '30-day returns, unworn, no questions asked. But if you return a Maximum Ugly sweater, we will judge you silently.';
  else if (msg.includes('ship') && msg.includes('cost') || msg.includes('shipping')) response = 'Free shipping on orders over $500. Standard shipping is $8. FPO/APO addresses supported.';
  else if (msg.includes('discount') || msg.includes('coupon') || msg.includes('code')) response = 'Active codes: FLEET10 (10% off), CHIEFS15 (15% off), MAXUGLY20 (20% off Maximum Ugly), WESTPAC25 (25% off crew orders).';
  else if (msg.includes('ugly') || msg.includes('ugliest')) response = 'Our Maximum Ugly collection has actual bells, lights, and 3D elements. Check out Bulldozer Bells and Drumsticks or Octopus on the Scope. They are catastrophically ugly.';
  else if (msg.includes('sub') || msg.includes('submarine')) response = 'Silent Service sweaters: Silent Night Silent Service, Octopus on the Scope, Dolphins in December. All feature subs, dolphins, and Santa hats underwater.';
  else if (msg.includes('aviation') || msg.includes('pilot') || msg.includes('catapult')) response = 'Naval Aviation sweaters: Santa Needs a Catapult is our top seller. Reindeer with cranials on the flight deck. Christmas lights on the island.';
  else if (msg.includes('seabee') || msg.includes('construction')) response = 'Seabees sweaters: Can Do Christmas and Bulldozer Bells and Drumsticks. Can Do spirit with gingerbread barracks and candy cane bulldozers.';
  else if (msg.includes('chief') || msg.includes('khaki') || msg.includes('goat')) response = 'Chiefs Mess sweaters: The Goat Ate My Watchbill is our most popular khaki design. Ask Me About My Holiday Watch on the back.';
  else if (msg.includes('family') || msg.includes('spouse') || msg.includes('mom') || msg.includes('veteran')) response = 'Navy Family sweaters: Navy Mom Navy Proud has an anchor heart and deployment countdown. Great gift for spouses and families.';
  else if (msg.includes('contest')) response = 'The Annual Ugly Sweater Contest runs every December. Submit your photo, get votes, win a free sweater. 847 entries last year from 194 ships.';
  else if (msg.includes('gift')) response = 'Gift cards available from $25 to $100. Or use our Gift Guide Quiz to find the perfect sweater for your sailor.';
  else if (msg.includes('delivery') || msg.includes('arrive') || msg.includes('when')) response = 'In-stock items ship in 2-3 business days. Custom orders take 3-4 weeks after proof approval. Order by December 1 for Christmas delivery.';
  else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) response = 'Ahoy! Welcome to UglyNavySweater.com. How can I help you get ugly today?';
  else if (msg.includes('thanks') || msg.includes('thank you')) response = 'Fair winds! Go get ugly.';
  res.json({ response, suggestions: ['What is your ugliest sweater?', 'How do I order for my ship?', 'What are the discount codes?'] });
});

// DESIGN TEMPLATES
const designTemplates = [
  { id: 1, name: 'Classic Carrier', community: 'aviation', elements: ['carrier silhouette', 'Santa hat on island', 'flight deck lights', 'catapult phrase'], colors: {c1:'#2d4a6e', c2:'#c9a227', c3:'#c41e3a'} },
  { id: 2, name: 'Submarine Santa', community: 'sub', elements: ['sub silhouette', 'periscope Santa hat', 'dolphins with hats', 'sonar pattern'], colors: {c1:'#0d5c5c', c2:'#c9a227', c3:'#0a1f3c'} },
  { id: 3, name: 'Destroyer Delights', community: 'surface', elements: ['destroyer silhouette', 'candy cane guns', 'signal flags', 'deck lights'], colors: {c1:'#1f4068', c2:'#c9a227', c3:'#c41e3a'} },
  { id: 4, name: 'Seabee Sleigh', community: 'seabees', elements: ['bulldozer', 'gingerbread barracks', 'bee mascot', 'wrench candy cane'], colors: {c1:'#8a6d1f', c2:'#c41e3a', c3:'#c9a227'} },
  { id: 5, name: 'Chiefs Goat', community: 'chiefs', elements: ['goat mascot', 'anchor', 'watchbill', 'khaki trim'], colors: {c1:'#6b5a2e', c2:'#c9a227', c3:'#c41e3a'} },
  { id: 6, name: 'Navy Family Heart', community: 'veteran', elements: ['anchor heart', 'deployment calendar', 'home for Christmas', 'gold star'], colors: {c1:'#5a2d4a', c2:'#c9a227', c3:'#c41e3a'} }
];
app.get('/api/design-templates', (req, res) => { res.json({ count: designTemplates.length, templates: designTemplates }); });

// BLOG POSTS
const blogPosts = [
  { id: 1, slug: 'navy-christmas-traditions', title: '5 Navy Christmas Traditions You Did Not Know About', excerpt: 'From the Chief\'s Mess potluck to the flight deck tree, Navy holiday traditions are as old as the fleet itself.', date: '2025-12-01', author: 'The Skipper', readTime: '4 min', category: 'Traditions' },
  { id: 2, slug: 'ugly-sweater-history', title: 'The History of the Ugly Christmas Sweater (Navy Edition)', excerpt: 'How an innocent knitwear trend became the most anticipated event on the mess decks.', date: '2025-12-05', author: 'Redstripe', readTime: '6 min', category: 'Culture' },
  { id: 3, slug: 'ship-spotlight-nimitz', title: 'Ship Spotlight: USS NIMITZ (CVN-68)', excerpt: 'The oldest active carrier in the fleet. Here is why Nimitz sailors have the best ugly sweater game.', date: '2025-12-10', author: 'The Skipper', readTime: '5 min', category: 'Ship Spotlight' },
  { id: 4, slug: 'deployment-gift-guide', title: 'Deployment Gift Guide: Sending Christmas to a Sailor', excerpt: 'Everything you need to know about mailing holiday cheer to an FPO address.', date: '2025-12-12', author: 'Ombudsman', readTime: '7 min', category: 'Gift Guide' },
  { id: 5, slug: 'how-to-win-ugly-sweater-contest', title: 'How to Win Your Command\'s Ugly Sweater Contest', excerpt: '10 tips from past winners. Spoiler: bells and lights are not optional.', date: '2025-12-15', author: 'Contest Champ', readTime: '5 min', category: 'Contest' },
  { id: 6, slug: 'christmas-mess-decks-traditions', title: 'Christmas on the Mess Decks: A Sailor\'s Holiday Feast', excerpt: 'From midrats to special holiday meals, the mess decks become the heart of the ship during the holidays.', date: '2025-12-18', author: 'The Skipper', readTime: '6 min', category: 'Traditions' },
  { id: 7, slug: 'watchbill-holiday-survival', title: 'Surviving the Holiday Watchbill: A Guide for First-Term Sailors', excerpt: 'How to make the most of port-and-starboard watches during December without losing your holiday spirit.', date: '2025-12-20', author: 'Redstripe', readTime: '4 min', category: 'Deployment Life' },
  { id: 8, slug: 'care-packages-for-deployed-sailors', title: 'Care Package Christmas: What to Send Your Sailor Overseas', excerpt: 'The best stocking stuffers and holiday treats that survive APO shipping and still make a sailor smile.', date: '2025-12-22', author: 'Ombudsman', readTime: '5 min', category: 'Gift Guide' },
  { id: 9, slug: 'new-years-underway', title: 'New Year\'s Eve Underway: Ringing In the New Year at Sea', excerpt: 'When the ball drops at 0000 zulu, sailors around the world celebrate in every time zone the ship crosses.', date: '2025-12-26', author: 'The Skipper', readTime: '4 min', category: 'Traditions' },
  { id: 10, slug: 'santa-comes-to-ship', title: 'When Santa Comes Aboard: The Navy\'s Christmas Day Tradition', excerpt: 'The CO dressed as Santa. The CMC as an elf. How Navy ships keep the magic alive even in the middle of the ocean.', date: '2025-12-28', author: 'Redstripe', readTime: '3 min', category: 'Traditions' }
];
app.get('/api/blog', (req, res) => { res.json({ count: blogPosts.length, posts: blogPosts }); });
app.get('/api/blog/:slug', (req, res) => {
  var post = blogPosts.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post, content: 'Full article content would appear here. This is a placeholder for the blog system.' });
});

// GIFT GUIDE QUIZ
const giftQuiz = [
  { id: 1, question: 'Who are you shopping for?', options: ['Active duty sailor', 'Veteran', 'Navy spouse', 'Navy kid', 'Myself (no judgment)'] },
  { id: 2, question: 'What community?', options: ['Surface Fleet', 'Submarine Service', 'Naval Aviation', 'Seabees', 'Chiefs Mess', 'Not sure'] },
  { id: 3, question: 'How ugly should it be?', options: ['Mild (wearable in public)', 'Moderate (command party ready)', 'Very ugly (turn heads)', 'Maximum ugly (bells and lights)'] },
  { id: 4, question: 'What is your budget?', options: ['Under $55', '$55-$70', '$70+', 'Money is no object'] }
];
app.get('/api/gift-quiz', (req, res) => { res.json({ count: giftQuiz.length, questions: giftQuiz }); });
app.post('/api/gift-quiz/result', (req, res) => {
  var { community, ugliness, budget } = req.body;
  var filtered = products.filter(function(p) {
    if (community && community !== 'Not sure' && p.community !== community) return false;
    if (ugliness === 0 && p.ugliness > 2) return false;
    if (ugliness === 1 && (p.ugliness < 2 || p.ugliness > 3)) return false;
    if (ugliness === 2 && p.ugliness < 3) return false;
    if (ugliness === 3 && p.ugliness < 4) return false;
    if (budget === 0 && p.price > 55) return false;
    if (budget === 1 && (p.price < 55 || p.price > 70)) return false;
    if (budget === 2 && p.price < 70) return false;
    return true;
  });
  res.json({ count: filtered.length, recommendations: filtered.slice(0, 4) });
});

// SHIP SPOTLIGHT
const shipSpotlights = [
  { ship: 'USS NIMITZ', hull: 'CVN-68', crew: 5000, fact: 'Oldest active carrier. Commissioned in 1975.', sweaterRec: 1 },
  { ship: 'USS ARLEIGH BURKE', hull: 'DDG-51', crew: 300, fact: 'Lead ship of the most numerous destroyer class since WWII.', sweaterRec: 6 },
  { ship: 'USS ILLINOIS', hull: 'SSN-786', crew: 135, fact: 'Virginia-class sub named after the Prairie State.', sweaterRec: 2 },
  { ship: 'USS ZUMWALT', hull: 'DDG-1000', crew: 175, fact: 'Stealth destroyer with wave-piercing tumblehome hull design.', sweaterRec: 10 },
  { ship: 'USS BOXER', hull: 'LHD-4', crew: 1200, fact: 'Amphibious assault ship capable of carrying a Marine Expeditionary Unit.', sweaterRec: 10 },
  { ship: 'USS NEW YORK', hull: 'LPD-21', crew: 400, fact: 'Built with 24 tons of steel from the World Trade Center in her bow.', sweaterRec: 10 },
  { ship: 'USS CONSTITUTION', hull: 'IX-21', crew: 60, fact: 'Oldest commissioned warship afloat. Launched in 1797. Old Ironsides.', sweaterRec: 6 }
];
app.get('/api/ship-spotlights', (req, res) => { res.json({ count: shipSpotlights.length, spotlights: shipSpotlights }); });

// REFERRAL PROGRAM
const referrals = {};
app.post('/api/referral', (req, res) => {
  var { referrerEmail, friendEmail } = req.body;
  if (!referrerEmail || !friendEmail) return res.status(400).json({ error: 'Both emails required' });
  var code = 'REF-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  referrals[code] = { referrer: referrerEmail, friend: friendEmail, code, status: 'sent', createdAt: new Date().toISOString() };
  res.status(201).json({ success: true, code, message: 'Referral sent. Both you and your friend get 10% off.' });
});

// GROUP BUY
app.post('/api/group-buy/create', (req, res) => {
  var { organizer, ship, targetQty, productId } = req.body;
  var groupBuyId = 'GB-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  res.status(201).json({ success: true, groupBuyId, organizer, ship, targetQty: targetQty || 12, productId, currentQty: 1, status: 'collecting', shareUrl: 'https://canvas.shroomffee.ai/ugly-navy-sweater/#group-' + groupBuyId });
});

app.post('/api/group-buy/join', (req, res) => {
  var { groupBuyId, name, size } = req.body;
  res.json({ success: true, groupBuyId, name, size, message: 'Added to group buy. Organizer will be notified.' });
});

// DEPOSIT / PAYMENT PLAN
app.post('/api/payment-plan', (req, res) => {
  var { total, depositPercent, months } = req.body;
  var deposit = Math.round(total * (depositPercent || 0.5) * 100) / 100;
  var remaining = Math.round((total - deposit) * 100) / 100;
  var monthly = Math.round(remaining / (months || 3) * 100) / 100;
  res.json({ total, deposit, remaining, monthly, months: months || 3, plan: '50% deposit, balance over ' + (months || 3) + ' months' });
});

// ADMIN DASHBOARD STATS
app.get('/api/admin/stats', (req, res) => {
  var totalRevenue = products.reduce(function(s, p) { return s + p.price * (p.stock > 30 ? 50 : 20); }, 0);
  var totalOrders = 2847 + new Date().getDate() * 37;
  var avgOrderValue = Math.round(totalRevenue / totalOrders * 100) / 100;
  var bestSeller = products.reduce(function(a, b) { return a.reviews > b.reviews ? a : b; });
  var conversionRate = 3.2 + Math.random();
  res.json({
    totalRevenue, totalOrders, avgOrderValue, conversionRate: Math.round(conversionRate * 10) / 10,
    bestSeller: { name: bestSeller.name, reviews: bestSeller.reviews, revenue: bestSeller.price * 47 },
    visitors: 12000 + Math.floor(Math.random() * 3000),
    cartAbandonRate: 68.4,
    customOrders: customOrders.length,
    newsletterSubs: 15
  });
});

app.get('/api/admin/revenue', (req, res) => {
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(); d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 3000) + 1500,
      orders: Math.floor(Math.random() * 40) + 20,
      visitors: Math.floor(Math.random() * 500) + 200
    });
  }
  res.json({ days, totalWeek: days.reduce(function(s, d) { return s + d.revenue; }, 0) });
});

// HALL OF FAME
const hallOfFame = [
  { year: 2024, winner: 'The Candy Cane RHIB', ship: 'USS BAINBRIDGE', votes: 847, author: 'HT2 Johnson' },
  { year: 2023, winner: 'Santa in the Periscope', ship: 'SSN-735', votes: 723, author: 'ET1 Morales' },
  { year: 2022, winner: 'Lighted Flight Deck', ship: 'VFA-147', votes: 611, author: 'LT Patel' },
  { year: 2021, winner: 'The Goat Ate Christmas', ship: 'USS ARLEIGH BURKE', votes: 534, author: 'CMDCM Smith' }
];
app.get('/api/hall-of-fame', (req, res) => { res.json({ count: hallOfFame.length, entries: hallOfFame }); });

// LEADERBOARD
app.get('/api/leaderboard', (req, res) => {
  var board = products.map(function(p) {
    return { name: p.name, sold: Math.floor(Math.random() * 200) + 50, revenue: p.price * (Math.floor(Math.random() * 200) + 50), community: p.commLabel };
  }).sort(function(a, b) { return b.sold - a.sold; }).slice(0, 10);
  res.json({ count: board.length, leaderboard: board });
});

// INSTAGRAM FEED (simulated)
const instagramPosts = [
  { id: 1, user: '@navywife_life', caption: 'Got my ugly sweater for the command party!', likes: 247, product: 9 },
  { id: 2, user: '@surfacewarrior', caption: 'Deck the Hulls indeed. XO approved.', likes: 189, product: 1 },
  { id: 3, user: '@silent_service_sub', caption: 'Silent Night Silent Service. Mess decks approved.', likes: 312, product: 2 },
  { id: 4, user: '@aviation_or_die', caption: 'Santa on the catapult. Maximum ugly.', likes: 428, product: 3 },
  { id: 5, user: '@seabee_cando', caption: 'Can Do Christmas. My bulldozer sweater arrived.', likes: 156, product: 4 },
  { id: 6, user: '@khaki_chief', caption: 'The goat ate my watchbill. Too real.', likes: 203, product: 5 }
];
app.get('/api/instagram', (req, res) => { res.json({ count: instagramPosts.length, posts: instagramPosts }); });

// SEASONAL CONTENT
app.get('/api/seasonal', (req, res) => {
  var month = new Date().getMonth();
  var season = month >= 9 || month <= 1 ? 'holiday' : month >= 2 && month <= 4 ? 'spring' : month >= 5 && month <= 8 ? 'summer' : 'fall';
  var content = {
    holiday: { banner: 'Holiday Season is Here', urgency: 'Order by December 1 for Christmas delivery', featured: 'Maximum Ugly collection' },
    spring: { banner: 'Spring Commissioning Sale', urgency: 'New designs reporting aboard', featured: 'Surface Fleet collection' },
    summer: { banner: 'Summer Liberty', urgency: 'Plan ahead for holiday parties', featured: 'Custom crew orders' },
    fall: { banner: 'Fall Readiness', urgency: 'Start your custom order now', featured: 'Pre-order holiday designs' }
  };
  res.json({ season, content: content[season] });
});

// WHOLESALE INQUIRY
app.post('/api/wholesale', (req, res) => {
  var { businessName, contactName, email, phone, location, interest } = req.body;
  if (!businessName || !email) return res.status(400).json({ error: 'Business name and email required' });
  var ref = 'WS-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, ref, message: 'Wholesale inquiry received. We will contact you within 2 business days.' });
});

// CORPORATE GIFTING
app.post('/api/corporate-gifting', (req, res) => {
  var { command, pointPerson, email, qty, budget } = req.body;
  if (!command || !email) return res.status(400).json({ error: 'Command and email required' });
  var ref = 'CG-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, ref, message: 'Corporate gifting inquiry received. We will send a custom quote within 1 business day.' });
});

// QR CODE DATA
app.get('/api/qr/:productId', (req, res) => {
  var pid = parseInt(req.params.productId);
  var product = products.find(p => p.id === pid);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json({ productId: pid, name: product.name, url: 'https://canvas.shroomffee.ai/ugly-navy-sweater/#product-' + pid, qrData: 'UNS-' + pid + '-' + product.slug });
});

// APPLE WALLET PASS DATA
app.get('/api/wallet-pass/:ref', (req, res) => {
  var ref = req.params.ref;
  res.json({
    passType: 'orderTracking',
    serialNumber: ref,
    title: 'UglyNavySweater Order',
    description: 'Your Sea Bag is underway',
    orderStatus: 'processing',
    total: '$' + (Math.floor(Math.random() * 200) + 50),
    estimatedDelivery: new Date(Date.now() + 26 * 86400000).toISOString().split('T')[0]
  });
});

// MULTI-LANGUAGE SUPPORT
const translations = {
  en: { shop: 'Shop', cart: 'Sea Bag', search: 'Search the fleet', checkout: 'Checkout', customOrder: 'Build a Crew Sweater' },
  es: { shop: 'Comprar', cart: 'Bolsa del Mar', search: 'Buscar la flota', checkout: 'Pagar', customOrder: 'Construir Suéter de Tripulación' },
  tl: { shop: 'Tindahan', cart: 'Bag ng Dagat', search: 'Hanapin ang fleet', checkout: 'Bayad', customOrder: 'Gumawa ng Crew Sweater' }
};
app.get('/api/translations/:lang', (req, res) => {
  var lang = req.params.lang;
  res.json({ lang, translations: translations[lang] || translations.en });
});

// A/B TESTING
const abTests = {
  'hero-headline': { variantA: 'UGLY SWEATERS. NAVY PROUD.', variantB: 'GET UGLY. STAY NAVY.', traffic: 50 },
  'cta-button': { variantA: 'Find My Sweater', variantB: 'Start Getting Ugly', traffic: 50 },
  'price-display': { variantA: 'show-price', variantB: 'show-from-price', traffic: 50 }
};
app.get('/api/ab-test/:testId', (req, res) => {
  var test = abTests[req.params.testId];
  if (!test) return res.status(404).json({ error: 'Test not found' });
  var variant = Math.random() < test.traffic / 100 ? 'A' : 'B';
  res.json({ testId: req.params.testId, variant: variant, value: variant === 'A' ? test.variantA : test.variantB });
});

// DEMAND FORECAST
app.get('/api/forecast', (req, res) => {
  var forecast = products.map(function(p) {
    var trend = Math.random() > 0.7 ? 'rising' : Math.random() > 0.5 ? 'stable' : 'falling';
    var weeksOfStock = Math.round(p.stock / 10 * 10) / 10;
    return { name: p.name, trend, weeksOfStock, willSellOut: weeksOfStock < 3, recommendation: weeksOfStock < 3 ? 'restock-now' : 'monitor' };
  });
  res.json({ forecast, urgentRestocks: forecast.filter(f => f.willSellOut).length });
});

// WEBHOOK REGISTRATION
const webhooks = [];
app.post('/api/webhooks/register', (req, res) => {
  var { url, events } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  var id = 'WH-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  webhooks.push({ id, url, events: events || ['order.created', 'stock.low'], createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, id, message: 'Webhook registered.' });
});

// CONTACT FORM
app.post('/api/contact', (req, res) => {
  var { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message required' });
  var ref = 'CT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, ref, message: 'Message received. We will respond within 1 business day.' });
});

// SUBSCRIPTION (Sweater of the Month)
app.post('/api/subscribe', (req, res) => {
  var { email, plan } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  var plans = { monthly: { price: 49, name: 'Monthly Ugly' }, quarterly: { price: 135, name: 'Quarterly Ugly', savings: 12 }, annual: { price: 499, name: 'Year Round Ugly', savings: 89 } };
  var selected = plans[plan] || plans.monthly;
  res.status(201).json({ success: true, email, plan: selected, message: 'You are subscribed to the Ugly Sweater of the Month Club. First sweater ships in 2 weeks.' });
});

// WISHLIST SYNC
app.post('/api/wishlist/sync', (req, res) => {
  var { items, sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });
  res.json({ success: true, sessionId, items: items || [], count: items ? items.length : 0, message: 'Wishlist synced across devices.' });
});

app.get('/api/wishlist/:sessionId', (req, res) => {
  res.json({ sessionId: req.params.sessionId, items: [], count: 0 });
});

// PRODUCT OF THE DAY
app.get('/api/product-of-day', (req, res) => {
  var day = new Date().getDate();
  var idx = day % products.length;
  var p = products[idx];
  res.json({
    product: p,
    reason: ['Trending in the Surface Fleet', 'Top rated this week', 'Crew order favorite', 'Maximum ugly champion', 'Back in stock after restock', 'Veteran pick of the week'][day % 6],
    dealPrice: Math.round(p.price * 0.85),
    savings: Math.round(p.price * 0.15),
    hoursLeft: 24 - new Date().getHours(),
    soldToday: Math.floor(Math.random() * 30) + 10
  });
});

// SIZE RECOMMENDATIONS
app.post('/api/size-rec', (req, res) => {
  var { height, weight, build, fit } = req.body;
  if (!height || !weight) return res.status(400).json({ error: 'Height and weight required' });
  var bmi = weight / Math.pow(height/100, 2);
  var size = 'M';
  if (bmi < 20) size = 'S';
  else if (bmi < 25) size = 'M';
  else if (bmi < 30) size = 'L';
  else if (bmi < 35) size = 'XL';
  else if (bmi < 40) size = 'XXL';
  else size = 'XXXL';
  if (fit === 'loose') size = size === 'S' ? 'M' : size === 'M' ? 'L' : size === 'L' ? 'XL' : size === 'XL' ? 'XXL' : 'XXXL';
  if (fit === 'slim' && size !== 'S') {
    var sizes = ['S','M','L','XL','XXL','XXXL'];
    size = sizes[Math.max(0, sizes.indexOf(size) - 1)];
  }
  res.json({
    recommendedSize: size,
    confidence: build === 'athletic' ? 'high' : 'medium',
    note: 'Based on Navy body type standards. For layering over uniforms, go one size up.',
    measurements: { height, weight, build: build || 'average', fit: fit || 'regular' }
  });
});

// GIFT WRAP OPTIONS
app.get('/api/gift-wrap', (req, res) => {
  res.json({
    options: [
      { id: 'none', name: 'No Wrap', price: 0 },
      { id: 'navy-gift', name: 'Navy Gift Wrap', price: 5, desc: 'Navy blue paper with gold anchor pattern, red ribbon.' },
      { id: 'sweater-box', name: 'Ugly Sweater Gift Box', price: 8, desc: 'Decorative box with signal flag tag. Includes gift card.' },
      { id: 'command-party', name: 'Command Party Pack', price: 12, desc: 'Bulk wrapping for crew orders. Navy flag tissue, anchor seal.' }
    ],
    giftCardOptions: [
      { id: 'basic', name: 'Standard Card', price: 0, desc: 'Plain white with Navy anchor watermark.' },
      { id: 'photo', name: 'Photo Card', price: 2, desc: 'Add a photo to the card. Ship silhouette border.' },
      { id: 'handwritten', name: 'Handwritten Note', price: 3, desc: 'Handwritten message in gold ink.' }
    ]
  });
});

// ENGRAVING / PERSONALIZATION
app.post('/api/engraving', (req, res) => {
  var { productId, text, position, font } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  if (text.length > 30) return res.status(400).json({ error: 'Text must be 30 characters or less' });
  var product = products.find(p => p.id === parseInt(productId));
  if (!product) return res.status(400).json({ error: 'Invalid product' });
  var positions = ['back-top', 'back-bottom', 'front-chest', 'sleeve-left', 'sleeve-right'];
  var validPos = positions.includes(position) ? position : 'back-top';
  var fonts = ['stencil', 'block', 'script', 'gold-foil'];
  var validFont = fonts.includes(font) ? font : 'stencil';
  var surcharge = validFont === 'gold-foil' ? 8 : validFont === 'script' ? 5 : 3;
  res.json({
    success: true,
    productId,
    productName: product.name,
    engraving: { text, position: validPos, font: validFont },
    surcharge,
    preview: {
      text: text.toUpperCase(),
      position: validPos,
      fontLabel: { stencil: 'Navy Stencil', block: 'Ship Block', script: 'Liberty Script', 'gold-foil': 'Gold Foil' }[validFont]
    },
    message: 'Engraving added. Preview ready for approval.'
  });
});

// CUSTOM DESIGN STUDIO (additional endpoints)
var mockOrders = [
  { ref: 'ORD-7K2F', date: 'Oct 5, 2026', status: 'underway', statusLabel: 'Underway', items: ['Deck the Hulls - L'], total: 64 },
  { ref: 'ORD-3H8A', date: 'Sep 28, 2026', status: 'delivered', statusLabel: 'Delivered', items: ['Silent Night - M'], total: 58 }
];
const signalFlags = {
  A: 'alpha', B: 'bravo', C: 'charlie', D: 'delta', E: 'echo', F: 'foxtrot',
  G: 'golf', H: 'hotel', I: 'india', J: 'juliet', K: 'kilo', L: 'lima',
  M: 'mike', N: 'november', O: 'oscar', P: 'papa', Q: 'quebec', R: 'romeo',
  S: 'sierra', T: 'tango', U: 'uniform', V: 'victor', W: 'whiskey', X: 'xray',
  Y: 'yankee', Z: 'zulu'
};

app.post('/api/design-studio/save', (req, res) => {
  var { design, name, sessionId } = req.body;
  if (!design) return res.status(400).json({ error: 'Design required' });
  var id = 'DSN-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, id, name: name || 'Untitled Design', message: 'Design saved to your profile.' });
});

app.post('/api/design-studio/share', (req, res) => {
  var { designId } = req.body;
  res.json({ success: true, shareUrl: 'https://canvas.shroomffee.ai/ugly-navy-sweater/?design=' + (designId || 'shared'), message: 'Share link generated.' });
});

app.post('/api/design-studio/proof', (req, res) => {
  var { designId, email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  var ref = 'PRF-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, ref, message: 'Design proof will be emailed within 3-5 business days.' });
});

app.get('/api/signal-flags/:phrase', (req, res) => {
  var phrase = req.params.phrase.toUpperCase().replace(/[^A-Z ]/g, '');
  var flags = phrase.split('').map(function(ch) {
    return ch === ' ' ? { char: ' ', flag: null } : { char: ch, flag: signalFlags[ch] || null };
  }).filter(function(f) { return f.flag || f.char === ' '; });
  res.json({ phrase: phrase, flags: flags });
});

// MULTI-CURRENCY
const currencies = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  EUR: { symbol: '\u20ac', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '\u00a3', rate: 0.79, name: 'British Pound' },
  JPY: { symbol: '\u00a5', rate: 149, name: 'Japanese Yen' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', rate: 1.36, name: 'Canadian Dollar' },
  PHP: { symbol: '\u20b1', rate: 56, name: 'Philippine Peso' }
};
app.get('/api/currencies', (req, res) => {
  res.json({ currencies: currencies, base: 'USD' });
});
app.get('/api/convert/:amount/:to', (req, res) => {
  var amount = parseFloat(req.params.amount);
  var to = req.params.to.toUpperCase();
  if (!currencies[to]) return res.status(400).json({ error: 'Currency not supported' });
  var converted = (amount * currencies[to].rate).toFixed(2);
  res.json({ from: 'USD', amount: amount, to: to, converted: parseFloat(converted), symbol: currencies[to].symbol });
});

// TAX CALCULATION
app.post('/api/tax-calc', (req, res) => {
  var { state, subtotal } = req.body;
  var taxRates = { CA: 0.0725, NY: 0.08, TX: 0.0625, FL: 0.06, VA: 0.043, WA: 0.065, HI: 0.04, AK: 0.0, OR: 0.0, MT: 0.0 };
  var rate = taxRates[(state || '').toUpperCase()] || 0.06;
  var tax = Math.round(subtotal * rate * 100) / 100;
  res.json({ state: state, rate: rate, tax: tax, total: Math.round((subtotal + tax) * 100) / 100 });
});

// SHIPPING ESTIMATOR
app.post('/api/shipping-est', (req, res) => {
  var { zip, weight, method, subtotal } = req.body;
  var methods = {
    standard: { name: 'Standard (3-5 days)', price: 7.99, days: '3-5' },
    express: { name: 'Express (1-2 days)', price: 15.99, days: '1-2' },
    overnight: { name: 'Overnight', price: 29.99, days: '1' },
    military: { name: 'FPO/APO/DPO Priority', price: 5.99, days: '5-7' },
    free: { name: 'Free Shipping (orders $75+)', price: 0, days: '3-5' }
  };
  var selected = methods[method] || methods.standard;
  if ((subtotal || 0) >= 75) selected = methods.free;
  res.json({ method: selected, zip: zip, estimatedDays: selected.days, cost: selected.price });
});

// PAYMENT PROCESSING (SIMULATED)
app.post('/api/checkout/stripe', (req, res) => {
  var { amount, currency, email } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount required' });
  var chargeId = 'ch_' + crypto.randomBytes(6).toString('hex');
  var orderId = 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, chargeId, orderId, amount: amount, currency: currency || 'USD', message: 'Payment processed. Order confirmed.' });
});

app.post('/api/checkout/apple-pay', (req, res) => {
  var { amount, email } = req.body;
  var orderId = 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, orderId, amount: amount, method: 'Apple Pay', message: 'Apple Pay payment processed.' });
});

app.post('/api/checkout/google-pay', (req, res) => {
  var { amount, email } = req.body;
  var orderId = 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, orderId, amount: amount, method: 'Google Pay', message: 'Google Pay payment processed.' });
});

app.post('/api/checkout/confirm', (req, res) => {
  var { orderId, email, items, total, address } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Order ID required' });
  res.status(201).json({
    success: true, orderId,
    confirmation: {
      orderRef: orderId,
      email: email,
      items: items || [],
      total: total || 0,
      address: address || {},
      status: 'Underway',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      trackingUrl: 'https://canvas.shroomffee.ai/ugly-navy-sweater/?track=' + orderId
    },
    message: 'Order confirmed. Confirmation email sent.'
  });
});

// INVOICE DOWNLOAD
app.get('/api/invoice/:orderId', (req, res) => {
  var oid = req.params.orderId;
  res.json({
    orderId: oid, date: new Date().toLocaleDateString(),
    billTo: { name: 'Customer', email: 'customer@navy.mil' },
    items: [{ name: 'Deck the Hulls - L', qty: 1, price: 64 }, { name: 'Santa Needs a Catapult - XL', qty: 1, price: 74 }],
    subtotal: 138, tax: 8.28, shipping: 0, total: 146.28,
    note: 'Thank you for your service. Same Sea. Uglier Sweaters.'
  });
});

// ABANDONED CART
app.post('/api/abandoned-cart', (req, res) => {
  var { email, items, total } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  var id = 'AC-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, id, message: 'Cart saved. Reminder email will be sent in 24 hours.' });
});

// USER ACCOUNTS
const users = [];
app.post('/api/auth/register', (req, res) => {
  var { email, password, name, branch, rank, ship } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  var id = crypto.randomBytes(4).toString('hex');
  var token = crypto.randomBytes(12).toString('hex');
  users.push({ id, email, name: name || '', branch: branch || 'Navy', rank: rank || '', ship: ship || '', createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, token, user: { id, email, name, branch, rank, ship }, message: 'Welcome aboard.' });
});

app.post('/api/auth/login', (req, res) => {
  var { email, password } = req.body;
  var user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  var token = crypto.randomBytes(12).toString('hex');
  res.json({ success: true, token, user: user, message: 'Welcome back.' });
});

app.post('/api/auth/reset', (req, res) => {
  var { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  var ref = 'RST-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.json({ success: true, ref, message: 'Password reset link sent to your email.' });
});

app.post('/api/auth/profile', (req, res) => {
  var { token, name, branch, rank, ship, bio } = req.body;
  res.json({ success: true, message: 'Profile updated.', profile: { name, branch, rank, ship, bio } });
});

app.get('/api/user/orders/:email', (req, res) => {
  res.json({ email: req.params.email, orders: mockOrders });
});

// LOYALTY POINTS
app.get('/api/loyalty/:email', (req, res) => {
  var points = Math.floor(Math.random() * 500) + 100;
  var tier = points < 200 ? 'Ensign' : points < 500 ? 'Lieutenant' : points < 1000 ? 'Commander' : 'Captain';
  res.json({
    points: points, tier: tier,
    nextTier: tier === 'Ensign' ? 'Lieutenant' : tier === 'Lieutenant' ? 'Commander' : tier === 'Commander' ? 'Captain' : 'Admiral',
    pointsToNext: tier === 'Ensign' ? 200 - points : tier === 'Lieutenant' ? 500 - points : tier === 'Commander' ? 1000 - points : 0,
    rewards: [
      { points: 100, name: '$10 Off', desc: '10% off next order' },
      { points: 250, name: 'Free Gift Wrap', desc: 'Free Navy gift wrap on any order' },
      { points: 500, name: 'Free Sweater', desc: 'One free sweater up to $80' },
      { points: 1000, name: 'Crew Order Discount', desc: '25% off entire crew order' }
    ]
  });
});

// COMMUNITY - PHOTO UPLOAD
app.post('/api/community/upload', (req, res) => {
  var { email, caption, ship, productId } = req.body;
  if (!caption) return res.status(400).json({ error: 'Caption required' });
  var id = 'PHO-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, id, message: 'Photo submitted. Will appear after moderation.' });
});

app.get('/api/community/photos', (req, res) => {
  res.json({
    photos: [
      { id: 'p1', author: 'ET2 Rodriguez', ship: 'USS BAINBRIDGE', caption: 'Wore this to Quarters. CMC not amused.', likes: 247, productId: 1 },
      { id: 'p2', author: 'MMCM Thompson', ship: 'USS NIMITZ', caption: 'Division holiday photo. 24 matching ugly.', likes: 412, productId: 2 },
      { id: 'p3', author: 'STG2 Chen', ship: 'USS HIGGINS', caption: 'Won the command contest. Unfair advantage.', likes: 589, productId: 12 },
      { id: 'p4', author: 'BU2 Santos', ship: 'NMCB-4', caption: 'Seabee ugly. Can Do Christmas.', likes: 178, productId: 4 },
      { id: 'p5', author: 'ABE3 Brooks', ship: 'USS EISENHOWER', caption: 'ASK ME ABOUT MY HOLIDAY WATCH.', likes: 334, productId: 3 },
      { id: 'p6', author: 'Jen Williams', ship: 'Navy Spouse', caption: 'Navy Mom ugly. My sailor cringed.', likes: 156, productId: 7 }
    ]
  });
});

app.post('/api/community/comment', (req, res) => {
  var { photoId, author, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment required' });
  res.status(201).json({ success: true, commentId: crypto.randomBytes(3).toString('hex'), message: 'Comment posted.' });
});

// SHIP GROUP PAGES
app.get('/api/ship-groups', (req, res) => {
  res.json({
    groups: [
      { id: 'sg1', ship: 'USS NIMITZ (CVN-68)', members: 347, sweaters: 89, nextReunion: '2027-06-15' },
      { id: 'sg2', ship: 'USS MIDWAY (CV-41)', members: 1247, sweaters: 234, nextReunion: '2027-09-20' },
      { id: 'sg3', ship: 'USS TEXAS (SSN-775)', members: 134, sweaters: 45, nextReunion: '2027-07-04' },
      { id: 'sg4', ship: 'USS EISENHOWER (CVN-69)', members: 892, sweaters: 156, nextReunion: '2027-05-30' },
      { id: 'sg5', ship: 'USS HIGGINS (DDG-76)', members: 280, sweaters: 67, nextReunion: '2027-10-12' },
      { id: 'sg6', ship: 'NMCB-4 Seabees', members: 445, sweaters: 112, nextReunion: '2027-08-15' }
    ]
  });
});

app.post('/api/ship-groups/join', (req, res) => {
  var { groupId, email } = req.body;
  res.status(201).json({ success: true, message: 'Joined ship group. Welcome aboard.' });
});

// REUNION ORGANIZER
app.post('/api/reunion/create', (req, res) => {
  var { ship, date, location, organizer, email } = req.body;
  if (!ship || !date) return res.status(400).json({ error: 'Ship and date required' });
  var id = 'RNU-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, id, ship, date, location: location || 'TBD', message: 'Reunion created. Invite link generated.' });
});

app.get('/api/reunions', (req, res) => {
  res.json({
    reunions: [
      { id: 'r1', ship: 'USS MIDWAY', date: '2027-09-20', location: 'San Diego, CA', attendees: 347 },
      { id: 'r2', ship: 'USS NIMITZ', date: '2027-06-15', location: 'Norfolk, VA', attendees: 234 },
      { id: 'r3', ship: 'USS TEXAS (SSN-775)', date: '2027-07-04', location: 'Pearl Harbor, HI', attendees: 89 }
    ]
  });
});

// GIFT REGISTRY
app.post('/api/gift-registry/create', (req, res) => {
  var { name, email, event, items } = req.body;
  var id = 'REG-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, id, message: 'Gift registry created. Share with friends and family.' });
});

app.get('/api/gift-registry/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Holiday Gift Registry', items: [{ productId: 1, name: 'Deck the Hulls', qty: 1, purchased: false }, { productId: 2, name: 'Silent Night, Silent Service', qty: 2, purchased: true }] });
});

// CORPORATE GIFTING
app.post('/api/corporate-gift', (req, res) => {
  var { company, contact, email, quantity, budget } = req.body;
  if (!company || !email) return res.status(400).json({ error: 'Company and email required' });
  var ref = 'CGF-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  res.status(201).json({ success: true, ref, message: 'Corporate gifting inquiry received. Quote within 2 business days.' });
});

// BULK IMPORT
app.post('/api/bulk-import', (req, res) => {
  var { csv, type } = req.body;
  if (!csv) return res.status(400).json({ error: 'CSV data required' });
  var lines = csv.split('\n').filter(function(l) { return l.trim(); });
  res.json({ success: true, imported: lines.length - 1, message: lines.length - 1 + ' items imported.' });
});

// DYNAMIC PRICING
app.get('/api/dynamic-pricing/:productId', (req, res) => {
  var pid = parseInt(req.params.productId);
  var product = products.find(function(p) { return p.id === pid; });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  var hour = new Date().getHours();
  var stockFactor = product.stock < 15 ? 1.1 : product.stock > 50 ? 0.95 : 1;
  var timeFactor = hour >= 22 || hour < 6 ? 0.9 : 1;
  var demandFactor = product.rating > 4.7 ? 1.05 : 1;
  var dynamicPrice = Math.round(product.price * stockFactor * timeFactor * demandFactor);
  res.json({
    productId: pid, name: product.name,
    originalPrice: product.price, dynamicPrice: dynamicPrice,
    factors: { stock: stockFactor, time: timeFactor, demand: demandFactor },
    discount: dynamicPrice < product.price ? product.price - dynamicPrice : 0,
    surge: dynamicPrice > product.price ? dynamicPrice - product.price : 0,
    reason: dynamicPrice < product.price ? 'Off-watch discount' : dynamicPrice > product.price ? 'High demand surge pricing' : 'Standard pricing'
  });
});

// PREDICTIVE SEARCH
app.get('/api/search/predict', (req, res) => {
  var q = (req.query.q || '').toLowerCase();
  if (!q || q.length < 2) return res.json({ suggestions: [] });
  var productMatches = products.filter(function(p) {
    return p.name.toLowerCase().indexOf(q) > -1 || p.desc.toLowerCase().indexOf(q) > -1 || p.commLabel.toLowerCase().indexOf(q) > -1;
  }).slice(0, 5).map(function(p) { return { type: 'product', id: p.id, name: p.name, price: p.price }; });
  var categories = ['Surface Fleet', 'Silent Service', 'Naval Aviation', 'Seabees', 'Chiefs Mess', 'Veterans', 'Maximum Ugly', 'Custom Crew', 'Gift Cards', 'Decommissioning Sale'];
  var catMatches = categories.filter(function(c) { return c.toLowerCase().indexOf(q) > -1; }).slice(0, 3).map(function(c) { return { type: 'category', name: c }; });
  var phrases = ['Deck the Hulls', 'Silent Night Silent Service', 'Santa Needs a Catapult', 'Can Do Christmas', 'All Hands on Holiday'];
  var phraseMatches = phrases.filter(function(p) { return p.toLowerCase().indexOf(q) > -1; }).slice(0, 3).map(function(p) { return { type: 'phrase', name: p }; });
  res.json({ suggestions: productMatches.concat(catMatches).concat(phraseMatches) });
});

// VOICE SEARCH (returns text to search)
app.post('/api/voice-search', (req, res) => {
  var { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: 'Transcript required' });
  var cleaned = transcript.toLowerCase().replace('navy', '').replace('ugly', '').replace('sweater', '').trim();
  var matches = products.filter(function(p) {
    return p.name.toLowerCase().indexOf(cleaned) > -1 || p.desc.toLowerCase().indexOf(cleaned) > -1 || p.commLabel.toLowerCase().indexOf(cleaned) > -1;
  }).slice(0, 5);
  res.json({ transcript: transcript, cleaned: cleaned, results: matches, count: matches.length });
});

// EMAIL AUTOMATION
app.post('/api/email/subscribe', (req, res) => {
  var { email, type } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  var types = { welcome: 'Welcome aboard email sent', abandoned: 'Abandoned cart reminder sent', order: 'Order confirmation sent', shipping: 'Shipping notification sent', restock: 'Restock alert sent' };
  res.json({ success: true, email: email, type: type, message: types[type] || 'Email sent' });
});

// AFFILIATE PROGRAM
app.post('/api/affiliate/register', (req, res) => {
  var { name, email, platform } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  var code = 'UGLY' + crypto.randomBytes(2).toString('hex').toUpperCase();
  res.status(201).json({ success: true, affiliateCode: code, commission: '15%', message: 'Affiliate account created. Share your code for 15% commission.' });
});

app.get('/api/affiliate/stats/:code', (req, res) => {
  res.json({ code: req.params.code, clicks: Math.floor(Math.random() * 500) + 50, conversions: Math.floor(Math.random() * 30) + 5, earnings: Math.floor(Math.random() * 500) + 50, pendingPayout: Math.floor(Math.random() * 100) + 10 });
});

// ADMIN DASHBOARD DATA
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    kpis: {
      revenue: { today: 4823, week: 28456, month: 127890, year: 1456789 },
      orders: { today: 47, week: 312, month: 1456, pending: 23 },
      customers: { total: 12487, new: 89, returning: 312 },
      products: { total: 12, lowStock: 3, outOfStock: 0, avgRating: 4.7 }
    },
    recentOrders: mockOrders.slice(0, 5),
    topProducts: products.slice(0, 5).map(function(p) { return { name: p.name, sold: Math.floor(Math.random() * 200) + 50, revenue: p.price * (Math.floor(Math.random() * 200) + 50) }; }),
    trafficSources: [
      { source: 'Direct', visits: 4521, pct: 35 },
      { source: 'Instagram', visits: 3210, pct: 25 },
      { source: 'Google', visits: 2890, pct: 22 },
      { source: 'Facebook', visits: 1567, pct: 12 },
      { source: 'Referral', visits: 789, pct: 6 }
    ]
  });
});

app.post('/api/admin/product/add', (req, res) => {
  var { name, community, price, sizes, stock, desc } = req.body;
  if (!name) return res.status(400).json({ error: 'Product name required' });
  var id = products.length + 1;
  res.status(201).json({ success: true, id, message: 'Product added to catalog.' });
});

app.post('/api/admin/product/update/:id', (req, res) => {
  res.json({ success: true, id: req.params.id, message: 'Product updated.' });
});

app.post('/api/admin/product/delete/:id', (req, res) => {
  res.json({ success: true, id: req.params.id, message: 'Product decommissioned.' });
});

// MULTI-LANGUAGE
app.get('/api/translations/:lang', (req, res) => {
  var lang = req.params.lang;
  var translations = {
    en: { seaBag: 'Sea Bag', newArrivals: 'Now Reporting Aboard', bestSellers: 'Fleet Favorites', clearance: 'Decommissioning Sale', checkout: 'Checkout', search: 'Search', add: 'Add to Sea Bag', track: 'Track Order' },
    es: { seaBag: 'Bolsa de Mar', newArrivals: 'Recien Llegados', bestSellers: 'Favoritos de la Flota', clearance: 'Venta de Descomision', checkout: 'Pagar', search: 'Buscar', add: 'Anadir a Bolsa', track: 'Rastrear Pedido' },
    tl: { seaBag: 'Bag sa Dagat', newArrivals: 'Bagong Pagdating', bestSellers: 'Paborito ng Fleet', clearance: 'Pagbenta ng Pag-decommission', checkout: 'Magbayad', search: 'Hanapin', add: 'Idagdag sa Bag', track: 'Subaybayan ang Order' }
  };
  res.json({ lang: lang, translations: translations[lang] || translations.en });
});

// HEATMAP DATA (simulated)
app.get('/api/heatmap', (req, res) => {
  var zones = ['hero', 'products', 'custom', 'contest', 'testimonials', 'help', 'footer'];
  var data = zones.map(function(z) {
    return { zone: z, clicks: Math.floor(Math.random() * 500) + 50, hoverTime: Math.floor(Math.random() * 30) + 5, conversionRate: Math.random() * 0.15 };
  });
  res.json({ heatmap: data, totalClicks: data.reduce(function(s, z) { return s + z.clicks; }, 0) });
});

// THIRD-PARTY API (Navy ship data)
app.get('/api/ships/search', (req, res) => {
  var q = (req.query.q || '').toUpperCase();
  var allShips = [
    { name: 'USS NIMITZ', hull: 'CVN-68', type: 'Carrier', class: 'Nimitz', commissioned: '1975', status: 'Active' },
    { name: 'USS EISENHOWER', hull: 'CVN-69', type: 'Carrier', class: 'Nimitz', commissioned: '1977', status: 'Active' },
    { name: 'USS MIDWAY', hull: 'CV-41', type: 'Carrier', class: 'Midway', commissioned: '1945', status: 'Museum' },
    { name: 'USS TEXAS', hull: 'SSN-775', type: 'Submarine', class: 'Virginia', commissioned: '2006', status: 'Active' },
    { name: 'USS HIGGINS', hull: 'DDG-76', type: 'Destroyer', class: 'Arleigh Burke', commissioned: '1999', status: 'Active' },
    { name: 'USS CARNEY', hull: 'DDG-64', type: 'Destroyer', class: 'Arleigh Burke', commissioned: '1996', status: 'Active' },
    { name: 'USS STOUT', hull: 'DDG-55', type: 'Destroyer', class: 'Arleigh Burke', commissioned: '1992', status: 'Active' },
    { name: 'USS ZUMWALT', hull: 'DDG-1000', type: 'Destroyer', class: 'Zumwalt', commissioned: '2016', status: 'Active' },
    { name: 'USS BAINBRIDGE', hull: 'DDG-96', type: 'Destroyer', class: 'Arleigh Burke', commissioned: '2005', status: 'Active' },
    { name: 'USS GERARD R. FORD', hull: 'CVN-78', type: 'Carrier', class: 'Ford', commissioned: '2017', status: 'Active' }
  ];
  var filtered = q ? allShips.filter(function(s) { return s.name.indexOf(q) > -1 || s.hull.indexOf(q) > -1; }) : allShips;
  res.json({ ships: filtered, count: filtered.length });
});

// --- CUSTOM SWEATER REQUESTS ---

const CUSTOM_REQUESTS_FILE = path.join(__dirname, 'custom-requests.json');

function loadCustomRequests() {
  try {
    if (fs.existsSync(CUSTOM_REQUESTS_FILE)) {
      return JSON.parse(fs.readFileSync(CUSTOM_REQUESTS_FILE, 'utf8'));
    }
  } catch (e) { console.error('Error loading custom requests:', e.message); }
  return [];
}

function saveCustomRequests(requests) {
  try {
    fs.writeFileSync(CUSTOM_REQUESTS_FILE, JSON.stringify(requests, null, 2));
  } catch (e) { console.error('Error saving custom requests:', e.message); }
}

// Submit a customization request
app.post('/api/customize-request', (req, res) => {
  const { customerName, email, phone, productName, productUrl, productId, requestType,
    shipName, hullNumber, rankName, sweaterSize, quantity, deliveryDate,
    description, artworkUrl, acknowledgment } = req.body;

  // Validate required fields
  if (!customerName || !email || !requestType || !sweaterSize || !description || !acknowledgment) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['customerName', 'email', 'requestType', 'sweaterSize', 'description', 'acknowledgment']
    });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  var requests = loadCustomRequests();
  var newRequest = {
    id: 'CSR-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    category: 'Custom Sweater Request',
    status: 'New Request',
    submittedAt: new Date().toISOString(),
    customerName: customerName,
    email: email,
    phone: phone || '',
    productName: productName || '',
    productUrl: productUrl || '',
    productId: productId || '',
    requestType: requestType,
    shipName: shipName || '',
    hullNumber: hullNumber || '',
    rankName: rankName || '',
    sweaterSize: sweaterSize,
    quantity: parseInt(quantity) || 1,
    deliveryDate: deliveryDate || '',
    description: description,
    artworkUrl: artworkUrl || '',
    acknowledgment: !!acknowledgment
  };

  requests.push(newRequest);
  saveCustomRequests(requests);

  console.log('[Custom Request] New submission:', newRequest.id, 'from', email, 'for', productName);

  res.json({
    success: true,
    message: 'Your customization request has been received. Our team will review it and contact you within two business days.',
    requestId: newRequest.id
  });
});

// List all customization requests (for admin)
app.get('/api/customize-requests', (req, res) => {
  var requests = loadCustomRequests();
  res.json({ requests: requests, count: requests.length });
});

// Get a single customization request
app.get('/api/customize-requests/:id', (req, res) => {
  var requests = loadCustomRequests();
  var req_found = requests.find(r => r.id === req.params.id);
  if (!req_found) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json({ request: req_found });
});

// Update request status (for admin workflow)
app.patch('/api/customize-requests/:id/status', (req, res) => {
  var requests = loadCustomRequests();
  var idx = requests.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  var validStatuses = ['New Request','Under Review','Information Needed','Quote Prepared','Proof Sent','Awaiting Approval','Approved','Invoice Sent','Paid','In Production','Fulfilled','Closed / Declined'];
  if (validStatuses.indexOf(req.body.status) === -1) {
    return res.status(400).json({ error: 'Invalid status', validStatuses: validStatuses });
  }
  requests[idx].status = req.body.status;
  requests[idx].statusUpdatedAt = new Date().toISOString();
  saveCustomRequests(requests);
  res.json({ success: true, request: requests[idx] });
});

// --- START ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`UglyNavySweater API running on port ${PORT}`);
});