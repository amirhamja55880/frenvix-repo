import Category from "@/models/Category";

// A product is shown on the website only when:
//  - the product itself is Active, AND
//  - its category exists and is visible, AND
//  - its sub category (if it has one) still exists and is visible.
// So hiding or removing a category / sub category hides its products automatically,
// and showing the category again brings them back. Nothing is deleted.
export async function visibleQuery(extra = {}) {
  const cats = await Category.find({ isActive: true }).select("name subs hiddenSubs").lean();
  const or = cats.map((c) => ({
    category: c.name,
    subCategory: { $in: ["", null, ...c.subs.filter((s) => !(c.hiddenSubs || []).includes(s))] },
  }));
  return { isActive: true, ...extra, ...(or.length ? { $or: or } : { _id: { $in: [] } }) };
}
