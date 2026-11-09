"use client";
import { usePathname } from "next/navigation";

// The storefront header/footer are not shown inside the admin panel.
export default function HideOnAdmin({ children }) {
  return usePathname().startsWith("/admin") ? null : children;
}
