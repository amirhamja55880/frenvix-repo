"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIVISIONS } from "@/lib/bd-geo";

const DISTRICTS = Object.values(DIVISIONS).flat().sort();

export default function SettingsForm({ initial }) {
  const router = useRouter();
  const [f, setF] = useState({ ...initial, deliveryInsideKhulna: String(initial.deliveryInsideKhulna), deliveryOutsideKhulna: String(initial.deliveryOutsideKhulna) });
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [bad, setBad] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true); setMsg(""); setBad(false);
    try {
      const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save");
      setMsg("Settings saved."); router.refresh();
    } catch (e) { setMsg(e.message); setBad(true); }
    setBusy(false);
  };
  return (
    <div className="panel" style={{ maxWidth: 640 }}>
      <h2>Contact</h2>
      <div className="row2">
        <div className="field"><label htmlFor="ph">Phone / WhatsApp</label><input id="ph" value={f.phone} onChange={set("phone")} /></div>
        <div className="field"><label htmlFor="em">Email</label><input id="em" value={f.email} onChange={set("email")} /></div>
      </div>
      <h2 style={{ marginTop: 10 }}>Delivery charge</h2>
      <div className="field"><label htmlFor="hd">Home district (lower charge applies here)</label><select id="hd" value={f.homeDistrict} onChange={set("homeDistrict")}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></div>
      <div className="row2">
        <div className="field"><label htmlFor="in">Inside {f.homeDistrict} (৳)</label><input id="in" inputMode="numeric" value={f.deliveryInsideKhulna} onChange={set("deliveryInsideKhulna")} /></div>
        <div className="field"><label htmlFor="out">Outside {f.homeDistrict} (৳)</label><input id="out" inputMode="numeric" value={f.deliveryOutsideKhulna} onChange={set("deliveryOutsideKhulna")} /></div>
      </div>
      {msg && <p className={bad ? "error" : "note"} role="status">{msg}</p>}
      <button className="btn dark" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
    </div>
  );
}
