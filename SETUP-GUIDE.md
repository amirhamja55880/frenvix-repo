# FRENVIX: Analytics, Meta Pixel, SEO ar SSLCommerz setup guide

Code-er kaj shesh. Ekhon apnake kebol account-gulo khule ID/key boshate hobe.
Order: **Deploy → SSLCommerz → GA4 → Meta Pixel → Search Console**.

---

## 0. Deploy age (shobcheye boro dhap)
1. Vercel e project deploy korun, tarpor nijer domain connect korun (Settings > Domains). **HTTPS/SSL certificate Vercel nijei free dey**, kichu korte hobe na.
2. Vercel > Settings > Environment Variables e ei ta set korun:
   - `NEXT_PUBLIC_SITE_URL` = `https://apnar-domain.com` (sitemap, canonical, payment callback shob eta theke ashe)
   - baki ager variable (MONGODB_URI, SMTP_*, AUTH_SECRET, CLOUDINARY_*) thakbe
3. Variable change korle **Redeploy** korte hobe.

## 1. SSLCommerz payment gateway
### Test (sandbox), free
1. https://developer.sslcommerz.com/registration/ e sandbox account khulun.
2. Email e **Store ID** ar **Store Password** ashbe.
3. `.env.local` (local) ar Vercel Environment Variables e din:
   ```
   SSLC_STORE_ID=apnar_store_id
   SSLC_STORE_PASSWORD=apnar_store_password
   SSLC_IS_LIVE=false
   ```
4. Redeploy korun. Checkout > Payment page e "Pay online (bKash, Nagad, Rocket, Card)" option dekhabe. (Key na dile ei option lukano thake, shudhu COD thake.)
5. Ekta test order din. SSLCommerz sandbox page e test card/mobile banking diye pay korun (test data: developer.sslcommerz.com/doc/v4 er "Test Card" section). Pay korle order **Paid** hobe, email jabe.
6. Sandbox merchant panel e (sandbox.sslcommerz.com/manage) **IPN URL** set korun: `https://apnar-domain.com/api/payment/ipn`

### Live (asol taka)
1. https://www.sslcommerz.com/ e merchant application din (trade licence/NID, bank account lage).
2. Approve hole live Store ID/Password pabena. Env te boshan ar `SSLC_IS_LIVE=true` korun, redeploy.
3. Live panel e o IPN URL ta set korun. Prothome nijer ekta chhoto order diye test korun.

Code ki kore: order toiri hoy (stock reserve), customer SSLCommerz e jay, pay korle SSLCommerz API diye payment **verify** kore (amount, tran id, BDT milay) tarpor-i Paid hoy. Fail/cancel hole order cancel hoy ar stock fire ashe.

## 2. Google Analytics 4
1. https://analytics.google.com > Admin > Create > Property > Web data stream, website URL din.
2. **Measurement ID** (`G-XXXXXXXXXX`) copy korun.
3. Admin panel > **Settings > Tracking & SEO > Google Analytics 4 ID** e paste kore Save.
4. Check: GA > Reports > Realtime, nijer site khule dekhun. Events pabe: `page_view, view_item, add_to_cart, begin_checkout, purchase`.
5. GA > Admin > Events e `purchase` ke **Key event** mark korun.

## 3. Meta (Facebook) Pixel
1. https://business.facebook.com/events_manager > Connect data sources > Web > Meta Pixel. Name din, **Pixel ID** (shudhu digit) copy korun.
2. Admin panel > Settings > Tracking & SEO > **Meta Pixel ID** e paste kore Save.
3. Check: Chrome e "Meta Pixel Helper" extension install kore site khulun. Events Manager > Test events e dekhun: `PageView, ViewContent, AddToCart, InitiateCheckout, Purchase`.
4. Ads er jonno Pixel e domain verify korun (Business Settings > Brand Safety > Domains).
5. Pore (optional): Conversions API add korle iOS e tracking aro bhalo hoy.

## 4. SEO (Google Search Console)
1. https://search.google.com/search-console > Add property > **URL prefix** > apnar `https://domain`.
2. Verification method **HTML tag** nin. `<meta name="google-site-verification" content="XXXX">` er **shudhu content="..." er vitorer code** copy korun.
3. Admin > Settings > Tracking & SEO > **Search Console verification code** e paste, Save. Tarpor Search Console e **Verify** click korun.
4. Search Console > Sitemaps e `sitemap.xml` submit korun.
5. Check korun: `https://domain/sitemap.xml` ar `https://domain/robots.txt` khule.

Code e ja ekhon ache: har page er title/description/canonical, Facebook/WhatsApp share preview (Open Graph), Product structured data (price, stock Google e dekhabe), Organization data, auto sitemap (product shoho), robots.txt (admin/api block), cart/checkout/order/track page e noindex.

Apni nijer kaj: proti product e valo description likhun (kom-pokkhe 2-3 line), Cloudinary photo-r bhalo naam, Google Business Profile banan, Facebook page e site link din.

## Dorkari shotorkota
- **Privacy policy** page e likhe din je site Google Analytics ar Meta Pixel (cookie) bebohar kore.
- Online payment e jodi customer tab bondho kore dey (fail/cancel e na giye), order **Pending + Unpaid + Online** thake ar stock reserve thake. Admin > Orders e eigulo dekhe cancel korben (cancel korle stock fire ashe).
- Ami ei sandbox e `npm install`/`npm run build` chalate pari nai (network bondho). Apni local e `npm install && npm run build` chalie dekhben, tarpor deploy korben.
