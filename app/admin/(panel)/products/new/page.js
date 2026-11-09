import Link from "next/link";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import ProductForm from "../ProductForm";

export default async function NewProduct() {
  await connectDB();
  const categories = JSON.parse(JSON.stringify(await Category.find().sort({ sortOrder: 1, name: 1 }).lean()));
  if (!categories.length) return <><h1>Add product</h1><p>Create a category first. <Link className="link" href="/admin/categories">Go to categories</Link></p></>;
  return <><p><Link className="link" href="/admin/products">← All products</Link></p><h1>Add product</h1><ProductForm categories={categories} /></>;
}
