import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductForm from "../ProductForm";

export default async function EditProduct({ params }) {
  await connectDB();
  const [product, categories] = await Promise.all([Product.findOne({ slug: params.slug }).lean(), Category.find().sort({ sortOrder: 1, name: 1 }).lean()]);
  if (!product) notFound();
  return <><p><Link className="link" href="/admin/products">← All products</Link></p><h1>Edit: {product.name}</h1><ProductForm categories={JSON.parse(JSON.stringify(categories))} product={JSON.parse(JSON.stringify(product))} /></>;
}
