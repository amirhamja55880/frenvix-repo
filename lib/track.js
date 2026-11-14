// Sends shop events to Google Analytics 4 and the Meta Pixel (only if they are switched on in Admin > Settings).
const CUR = "BDT";
const gt = (...a) => { try { window.gtag && window.gtag(...a); } catch {} };
const fb = (...a) => { try { window.fbq && window.fbq(...a); } catch {} };
const line = (i) => ({ item_id: i.slug, item_name: i.name, item_category: i.category, price: i.price, quantity: i.qty || 1 });

export const track = {
  pageView(url) { gt("event", "page_view", { page_location: url }); fb("track", "PageView"); },
  viewItem(p) {
    gt("event", "view_item", { currency: CUR, value: p.price, items: [line({ ...p, qty: 1 })] });
    fb("track", "ViewContent", { content_ids: [p.slug], content_name: p.name, content_type: "product", value: p.price, currency: CUR });
  },
  addToCart(i) {
    gt("event", "add_to_cart", { currency: CUR, value: i.price * i.qty, items: [line(i)] });
    fb("track", "AddToCart", { content_ids: [i.slug], content_name: i.name, content_type: "product", value: i.price * i.qty, currency: CUR });
  },
  beginCheckout(items, value) {
    gt("event", "begin_checkout", { currency: CUR, value, items: items.map(line) });
    fb("track", "InitiateCheckout", { content_ids: items.map((i) => i.slug), num_items: items.reduce((a, i) => a + i.qty, 0), value, currency: CUR });
  },
  // Runs once per order, even if the customer refreshes the thank-you page.
  purchase(o) {
    try {
      const key = "frx_tracked_" + o.id;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {}
    gt("event", "purchase", { transaction_id: o.id, currency: CUR, value: o.total, shipping: o.fee, items: o.items.map(line) });
    fb("track", "Purchase", { content_ids: o.items.map((i) => i.slug), content_type: "product", num_items: o.items.reduce((a, i) => a + i.qty, 0), value: o.total, currency: CUR }, { eventID: o.id });
  },
};
