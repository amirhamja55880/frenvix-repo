"use client";
import { useState } from "react";
import { TOPICS, validateContact } from "@/lib/contactValidate";

// Defined outside the form so the cursor never jumps while typing.
function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}{hint && <span className="muted small" style={{ fontWeight: 400 }}> {hint}</span>}</label>
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

const EMPTY = { name: "", phone: "", email: "", subject: TOPICS[0], orderId: "", message: "", website: "" };

export default function ContactForm() {
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [fail, setFail] = useState("");
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault(); setFail("");
    const { errors, ok } = validateContact(f);
    setErrs(errors);
    if (!ok) return;
    setBusy(true);
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not send your message.");
      setDone(true); setF(EMPTY);
    } catch (e) { setFail(e.message); }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="cdone" role="status">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M7.5 12.5l3 3 6-7" /></svg>
        <h3>Message sent</h3>
        <p className="muted">Thank you. We have received your message and will reply within one working day.</p>
        <button className="btn outline" onClick={() => setDone(false)}>Send another message</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} style={{ position: "absolute", left: "-9999px" }} />
      <Field id="c-name" label="Your name" error={errs.name}><input id="c-name" value={f.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errs.name} /></Field>
      <div className="row2">
        <Field id="c-phone" label="Phone" hint="(or email)" error={errs.phone}><input id="c-phone" value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={!!errs.phone} /></Field>
        <Field id="c-email" label="Email" hint="(optional if you gave a phone)" error={errs.email}><input id="c-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errs.email} /></Field>
      </div>
      <div className="row2">
        <Field id="c-subject" label="What is it about?" error={errs.subject}><select id="c-subject" value={f.subject} onChange={set("subject")}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field id="c-order" label="Order ID" hint="(if it is about an order)" error={errs.orderId}><input id="c-order" value={f.orderId} onChange={set("orderId")} placeholder="FRX-XXXXXXXX" aria-invalid={!!errs.orderId} /></Field>
      </div>
      <Field id="c-msg" label="Your message" error={errs.message}>
        <textarea id="c-msg" rows={5} value={f.message} onChange={set("message")} maxLength={1000} aria-invalid={!!errs.message} />
        <span className="muted small" style={{ display: "block", textAlign: "right" }}>{f.message.length}/1000</span>
      </Field>
      {fail && <p className="error" role="alert">{fail}</p>}
      <button className="btn dark full" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}
