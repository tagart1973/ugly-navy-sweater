# UglyNavySweater

**Ugly Sweaters. Navy Proud.**
*Same Sea. Uglier Sweaters.*

Navy-themed ugly sweater e-commerce site with custom crew orders, ship personalization, and an AI ugly sweater generator.

## Live Site
https://canvas.shroomffee.ai/ugly-navy-sweater/

## Tech Stack
- **Frontend:** Single-file HTML/CSS/JS (~650KB) served via nginx
- **Backend:** Node.js/Express API (port 3005, pm2 managed)
- **Products:** 107 Shopify products from harvestmarket.coffee
- **Server:** VPS with nginx reverse proxy

## Features
- Product catalog with Quick View modals
- "Customize This Sweater" flow with payment integration
- Ship/hull number personalization for crew orders
- AI Ugly Sweater Generator (lead generation)
- Ugliness rating system (Liberty Approved -> Maximum Ugly)
- Community sections (Surface, Submarine, Aviation, Seabees, Chiefs)
- Custom request API with 12-state workflow

## Project Structure
```
ugly-navy-sweater.html   - Main single-page frontend
shop.html                - Shop page
products.json            - Product catalog data
manifest.json            - PWA manifest
sw.js                    - Service worker
backend/
  server.js              - Express API server
  shopify-products.js    - Shopify product sync
  package.json           - Node dependencies
```

## API Endpoints
- `POST /api/customize-request` - Submit customization request
- `POST /api/customize-request/submit-with-payment` - Submit with payment
- `GET /api/customize-requests` - List all requests (admin)
- `GET /api/customize-requests/:id` - Get single request
- `PATCH /api/customize-requests/:id/status` - Update workflow status

## Brand
Independent business. Not affiliated with or endorsed by the Department of the Navy.