"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const links = [["/admin", "Dashboard"], ["/admin/orders", "Orders"], ["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/banners", "Banners"], ["/admin/messages", "Messages"], ["/admin/customers", "Customers"], ["/admin/settings", "Settings"]];

export default function AdminNav({ email, newMessages = 0 }) {
  const path = usePathname();
  const router = useRouter();
  const out = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); };
  return (
    <aside className="adm-side">
      <Link href="/admin" className="logo" aria-label="FRENVIX"><Logo variant="light" height={26} /></Link>
      {links.map(([h, l]) => (
        <Link key={h} href={h} className={(h === "/admin" ? path === h : path.startsWith(h)) ? "on" : ""}>
          {l}{h === "/admin/messages" && newMessages > 0 && <span className="nbadge">{newMessages}</span>}
        </Link>
      ))}
      <Link href="/" target="_blank">View website ↗</Link>
      <span className="spacer" />
      <span className="small" style={{ padding: "0 12px", color: "#888", wordBreak: "break-all" }}>{email}</span>
      <button onClick={out}>Log out</button>
    </aside>
  );
}
