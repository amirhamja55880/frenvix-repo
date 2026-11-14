"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIVISIONS } from "@/lib/bd-geo";

const DISTRICTS = Object.values(DIVISIONS).flat().sort();

export default function SettingsForm({ initial }) {
  const router = useRouter();
  const [f, setF] = useState({ ...initial, announcements: initial.announcements || [], deliveryInsideKhulna: String(initial.deliveryInsideKhulna), deliveryOutsideKhulna: String(initial.deliveryOutsideKhulna) });
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [bad, setBad] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setMsgRow = (i, v) => setF({ ...f, announcements: f.announcements.map((t, k) => (k === i ? v : t)) });
  const save = async () => {
    setBusy(true); setMsg(""); setBad(false);
    try {
      const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save");
      setMsg("Settings saved. The website shows the new details now."); router.refresh();
    } catch (e) { setMsg(e.message); setBad(true); }
    setBusy(false);
  };
  return (
    <div style={{ maxWidth: 680 }}>
      <div className="panel">
        <h2>Moving bar at the top of the website</h2>
        <p className="muted small" style={{ marginTop: -6 }}>These messages scroll across the top of every page, like a news ticker. Remove all of them to hide the bar.</p>
        {f.announcements.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <input value={t} maxLength={120} onChange={(e) => setMsgRow(i, e.target.value)} aria-label={`Message ${i + 1}`} />
            <button type="button" className="link" onClick={() => setF({ ...f, announcements: f.announcements.filter((_, k) => k !== i) })}>Remove</button>
          </div>
        ))}
        {f.announcements.length < 10 && <button type="button" className="chip" onClick={() => setF({ ...f, announcements: [...f.announcements, ""] })}>+ Add message</button>}
      </div>
      <div className="panel">
        <h2>Contact details</h2>
        <p className="muted small" style={{ marginTop: -6 }}>These show on the Contact page, the footer and the home page. Leave a field empty to hide it.</p>
        <div className="row2">
          <div className="field"><label htmlFor="ph">Phone number</label><input id="ph" value={f.phone} onChange={set("phone")} /></div>
          <div className="field"><label htmlFor="wa">WhatsApp number</label><input id="wa" value={f.whatsapp} onChange={set("whatsapp")} placeholder="optional" /></div>
        </div>
        <div className="field"><label htmlFor="em">Email</label><input id="em" value={f.email} onChange={set("email")} /></div>
        <div className="field"><label htmlFor="ad">Address</label><input id="ad" value={f.address} onChange={set("address")} placeholder="optional, e.g. shop or office address" /></div>
        <div className="field"><label htmlFor="hr">Opening hours</label><input id="hr" value={f.hours} onChange={set("hours")} placeholder="optional, e.g. Saturday to Thursday, 10 am to 8 pm" /></div>
        <div className="row2">
          <div className="field"><label htmlFor="fb">Facebook page link</label><input id="fb" value={f.facebook} onChange={set("facebook")} placeholder="https://facebook.com/…" /></div>
          <div className="field"><label htmlFor="ig">Instagram link</label><input id="ig" value={f.instagram} onChange={set("instagram")} placeholder="https://instagram.com/…" /></div>
        </div>
      </div>
      <div className="panel">
        <h2>Tracking &amp; SEO</h2>
        <p className="muted small" style={{ marginTop: -6 }}>Paste the IDs from Google and Meta. Leave a field empty to switch that tool off.</p>
        <div className="row2">
          <div className="field"><label htmlFor="ga">Google Analytics 4 ID</label><input id="ga" value={f.gaId || ""} onChange={set("gaId")} placeholder="G-XXXXXXXXXX" /></div>
          <div className="field"><label htmlFor="px">Meta Pixel ID</label><input id="px" value={f.pixelId || ""} onChange={set("pixelId")} inputMode="numeric" placeholder="1234567890123456" /></div>
        </div>
        <div className="field"><label htmlFor="gs">Google Search Console verification code</label><input id="gs" value={f.gscVerification || ""} onChange={set("gscVerification")} placeholder="only the code after content=" /></div>
      </div>
      <div className="panel">
        <h2>Delivery charge</h2>
        <div className="field"><label htmlFor="hd">Home district (lower charge applies here)</label><select id="hd" value={f.homeDistrict} onChange={set("homeDistrict")}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div className="row2">
          <div className="field"><label htmlFor="in">Inside {f.homeDistrict} (৳)</label><input id="in" inputMode="numeric" value={f.deliveryInsideKhulna} onChange={set("deliveryInsideKhulna")} /></div>
          <div className="field"><label htmlFor="out">Outside {f.homeDistrict} (৳)</label><input id="out" inputMode="numeric" value={f.deliveryOutsideKhulna} onChange={set("deliveryOutsideKhulna")} /></div>
        </div>
      </div>
      {msg && <p className={bad ? "error" : "note"} role="status">{msg}</p>}
      <button className="btn dark" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
    </div>
  );
}
