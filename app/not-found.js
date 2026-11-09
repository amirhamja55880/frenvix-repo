import Link from "next/link";
export default function NotFound() {
  return <div className="wrap section empty"><h1 className="pagetitle">Page not found</h1><p className="muted">This page does not exist or has moved.</p><Link className="btn dark" href="/shop">Go to shop</Link></div>;
}
