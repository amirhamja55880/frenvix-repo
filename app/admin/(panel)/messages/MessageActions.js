"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageActions({ id, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const run = async (method, body) => {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/admin/messages/${id}`, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Failed");
      router.refresh();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <button className="btn dark" style={{ padding: "8px 18px" }} disabled={busy} onClick={() => run("PATCH", { status: status === "New" ? "Done" : "New" })}>{status === "New" ? "Mark as done" : "Mark as new"}</button>
      <button className="btn outline" style={{ padding: "8px 18px", color: "#b91c1c", borderColor: "#b91c1c" }} disabled={busy} onClick={() => confirm("Delete this message?") && run("DELETE")}>Delete</button>
      {err && <span className="error">{err}</span>}
    </div>
  );
}
