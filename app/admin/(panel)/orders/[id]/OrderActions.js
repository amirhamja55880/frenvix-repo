"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function OrderActions({ orderId, status, paymentStatus }) {
  const router = useRouter();
  const [sel, setSel] = useState(status);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const locked = status === "Cancelled";

  const save = async (body) => {
    if (body.status === "Cancelled" && !confirm("Cancel this order? Stock will be returned and this cannot be undone.")) return;
    setBusy(true); setMsg("");
    try {
      const r = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setMsg(d.emailed ? "Updated. Customer was emailed." : "Updated.");
      router.refresh();
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  return (
    <div>
      <div className="field"><label htmlFor="st">Order status</label>
        <select id="st" value={sel} onChange={(e) => setSel(e.target.value)} disabled={locked}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400, margin: "0 0 12px" }}>
        <input type="checkbox" style={{ width: "auto" }} checked={notify} onChange={(e) => setNotify(e.target.checked)} disabled={locked} /> Email the customer about this change
      </label>
      <button className="btn dark full" style={{ marginTop: 0 }} disabled={busy || locked || sel === status} onClick={() => save({ status: sel, notify })}>Update status</button>
      {locked && <p className="muted small" style={{ marginTop: 8 }}>Cancelled orders cannot be changed.</p>}
      <hr />
      <button className="btn outline full" style={{ marginTop: 0 }} disabled={busy} onClick={() => save({ paymentStatus: paymentStatus === "Paid" ? "Unpaid" : "Paid" })}>
        {paymentStatus === "Paid" ? "Mark as unpaid" : "Mark as paid"}
      </button>
      <button className="btn outline full" onClick={() => window.print()}>Print invoice</button>
      {msg && <p className="note" role="status" style={{ marginBottom: 0 }}>{msg}</p>}
    </div>
  );
}
