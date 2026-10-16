# UglyNavySweater.com

Navy-themed ugly Christmas sweater storefront for Harvest Market (harvestmarket.coffee).

## Live Site
https://canvas.shroomffee.ai/ugly-navy-sweater/

## Stack
- Frontend: Single-file HTML/CSS/JS (PWA, dark navy theme)
- Backend: Node.js Express API (port 3005)
- Products: Synced from Shopify (harvestmarket.coffee) via Admin API
- Server: PM2 + Nginx on Ubuntu VPS

## Features
- 118 Navy ugly sweater products synced from Shopify
- Hourly auto-sync from Shopify collection "SB Ugly Sweater"
- Sort by: Newest First, Oldest First, Fleet Order, Price, Ugliness Rating, Top Rated
- Pagination with clickable page numbers (24 per page)
- Quick View modal with multi-image gallery
- Community filters (Surface Fleet, Silent Service, Naval Aviation, Amphibious, etc.)
- Grid and Masonry layout toggle
- Loyalty program, community contest, design studio
- Mobile responsive, accessibility features, SEO structured data

## Product Sync
Products are pulled from Shopify collection ID 499207209272 (tag: "SB-Ugly Sweater").
The sync script (`sync-shopify.js`) fetches all products and regenerates `backend/shopify-products.js`.

To run a manual sync:
```bash
cd /opt/ugly-navy-api
SHOPIFY_ADMIN_TOKEN=your_token_here node sync-shopify.js
pm2 restart ugly-navy-api
```

An hourly cron job runs this automatically on the server.

## File Structure
```
ugly-navy-sweater.html  - Main frontend (single-file HTML/CSS/JS)
products.json           - Product data for frontend (sorted newest first)
shop.html               - Alternate shop page
sw.js                   - Service worker (self-destructing)
sync-shopify.js         - Shopify product sync script
backend/
  server.js             - Express API server (90+ endpoints)
  shopify-products.js   - Auto-generated product data (from Shopify sync)
  package.json          - Node dependencies
```