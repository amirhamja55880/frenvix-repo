# FRENVIX storefront (Next.js 14, App Router)

    npm install
    npm run dev      # http://localhost:3000

- Products: `lib/products.js` (replace with MongoDB when the admin panel is built)
- Store settings (phone, delivery fee): `lib/products.js` -> `SITE`
- Product photos: put files in `public/products/` and list them in `images: []`
- Order email: copy `.env.example` to `.env.local` and fill SMTP values
- Orders are kept in the browser (localStorage) until the database is added

## Phase 3 setup (orders + email)
1. Copy `.env.example` to `.env.local` and fill MONGODB_URI, SMTP_USER, SMTP_PASS, ADMIN_EMAIL
2. `npm install` (adds mongoose), then `npm run dev`
3. Place a test order. Check: order saved in MongoDB (collection `orders`), customer email + admin email received
