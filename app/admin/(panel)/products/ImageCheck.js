"use client";
import { useState } from "react";

export default function ImageCheck() {
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const run = async () => {
    setBusy(true); setRes(null);
    try {
      const r = await fetch("/api/admin/upload-test", { method: "POST" });
      setRes(await r.json());
    } catch { setRes({ ok: false, message: "Could not run the test. Is the server running?" }); }
    setBusy(false);
  };
  let text = "", good = false;
  if (res) {
    if (!res.ok) text = `❌ ${res.message}`;
    else if (res.rawStatus === 200 && res.resizedStatus === 200) { good = true; text = "✅ Image upload works. Photos you upload can be shown on the website."; }
    else if (res.rawStatus === 200) text = `⚠️ Upload works, but the resized picture is blocked (code ${res.resizedStatus}). Send this message to your developer helper.`;
    else text = `⚠️ Upload worked but the picture cannot be opened (codes ${res.rawStatus} / ${res.resizedStatus}).`;
  }
  return (
    <div className="panel" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      <button className="btn outline" style={{ padding: "8px 18px" }} onClick={run} disabled={busy}>{busy ? "Testing…" : "Test image upload"}</button>
      <span className="muted small">Checks that Cloudinary is set up correctly for product photos.</span>
      {res && <p className={good ? "note" : "error"} role="status" style={{ width: "100%", margin: 0 }}>{text}</p>}
    </div>
  );
}
