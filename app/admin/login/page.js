"use client";
import { useState } from "react";

export default function Login() {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Login failed");
      window.location.href = "/admin";
    } catch (x) { setErr(x.message); setBusy(false); }
  };
  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        <div className="logo" style={{ marginBottom: 6 }}>FRENVIX</div>
        <p className="muted small" style={{ marginBottom: 20 }}>Admin login</p>
        <div className="field"><label htmlFor="em">Email</label><input id="em" type="email" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div className="field"><label htmlFor="pw">Password</label><input id="pw" type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn dark full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
