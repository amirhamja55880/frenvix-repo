import { revalidateTag, revalidatePath } from "next/cache";

// Call after the admin changes products, categories or settings so the website shows the change straight away.
export function refreshSite(...tags) {
  tags.forEach((t) => revalidateTag(t));
  revalidatePath("/", "layout");
}
