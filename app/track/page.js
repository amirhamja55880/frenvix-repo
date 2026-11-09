"use client";
import { useEffect, useState } from "react";
import { taka } from "@/lib/products";

export default function Track() {
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("id");
    if (q) setId(q.toUpperCase());
  }, []);
  const go = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setRes(null);
    try {
      const r = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, phone }),
      });
      const d = await r.json();
      r.ok ? setRes(d) : setErr(d.error);
    } catch {
      setErr("Network error, please try again.");
    }
    setBusy(false);
  };
  return (
    <div className="wrap section narrow">
      <h1 className="pagetitle">Track your order</h1>
      <form onSubmit={go}>
        <div className="field">
          <label htmlFor="oid">Order number</label>
          <input
            id="oid"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="FRX-XXXXXXXX"
          />
        </div>
        <div className="field">
          <label htmlFor="op">Phone number</label>
          <input
            id="op"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
          />
        </div>
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        <button className="btn dark full" disabled={busy}>
          {busy ? "Checking…" : "Check status"}
        </button>
      </form>
      {res && (
        <div className="summary" style={{ marginTop: 24 }}>
          <span className="pill">{res.status}</span>
          <p style={{ marginTop: 10 }}>
            {res.itemCount} item(s) · {taka(res.total)} ·{" "}
            {new Date(res.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>
      )}
    </div>
  );
}
