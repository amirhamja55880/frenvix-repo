import { connectDB } from "@/lib/db";
import Banner from "@/models/Banner";
import BannerManager from "./BannerManager";

export default async function Banners() {
  await connectDB();
  const list = await Banner.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const initial = list.map((b) => ({ id: String(b._id), image: b.image, mobileImage: b.mobileImage || "", link: b.link || "", alt: b.alt || "", sortOrder: b.sortOrder, isActive: b.isActive }));
  return <><h1>Home banners</h1><BannerManager initial={initial} /></>;
}
