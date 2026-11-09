"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { DIVISIONS } from "@/lib/bd-geo";
import { taka } from "@/lib/products";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  division: "",
  district: "",
  thana: "",
  address: "",
  note: "",
  website: "",
};

// Defined OUTSIDE the page component so inputs keep focus while typing.
function Field({ id, label, error, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={!!error} {...rest} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, ready } = useCart();
  const router = useRouter();
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem("frx_checkout"));
      if (s) setF({ ...EMPTY, ...s });
    } catch {}
  }, []);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setDivision = (e) =>
    setF((p) => ({ ...p, division: e.target.value, district: "" }));

  if (!ready) return <div className="wrap section" />;
  if (!items.length)
    return (
      <div className="wrap section empty">
        <h1 className="pagetitle">Nothing to check out</h1>
        <Link className="btn dark" href="/shop">
          Browse products
        </Link>
      </div>
    );

  const submit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (f.name.trim().length < 3) e.name = "Enter your full name.";
    if (!/^01[3-9]\d{8}$/.test(f.phone.trim()))
      e.phone = "Enter a valid 11-digit mobile number.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()))
      e.email = "Enter a valid email address.";
    if (!f.division) e.division = "Select your division.";
    if (!f.district) e.district = "Select your district.";
    if (f.thana.trim().length < 2) e.thana = "Enter your thana / upazila.";
    if (f.address.trim().length < 10)
      e.address = "Enter your full address (house, road, area).";
    setErrs(e);
    if (Object.keys(e).length) return;
    sessionStorage.setItem("frx_checkout", JSON.stringify(f));
    router.push("/checkout/payment");
  };

  return (
    <div className="wrap section">
      <div className="steps">
        <b>1. Delivery details</b>
        <span>›</span>
        <span>2. Delivery charge &amp; payment</span>
      </div>
      <h1 className="pagetitle">Delivery details</h1>
      <div className="two">
        <form onSubmit={submit} noValidate>
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={f.website}
            onChange={set("website")}
            style={{ position: "absolute", left: "-9999px" }}
          />
          <Field
            id="name"
            label="Full name"
            value={f.name}
            onChange={set("name")}
            error={errs.name}
            autoComplete="name"
          />
          <div className="row2">
            <Field
              id="phone"
              label="Mobile number"
              value={f.phone}
              onChange={set("phone")}
              error={errs.phone}
              inputMode="tel"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
            />
            <Field
              id="email"
              label="Gmail"
              type="email"
              value={f.email}
              onChange={set("email")}
              error={errs.email}
              autoComplete="email"
            />
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="division">Division</label>
              <select
                id="division"
                value={f.division}
                onChange={setDivision}
                aria-invalid={!!errs.division}
              >
                <option value="">Select division</option>
                {Object.keys(DIVISIONS).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {errs.division && <p className="error">{errs.division}</p>}
            </div>
            <div className="field">
              <label htmlFor="district">District</label>
              <select
                id="district"
                value={f.district}
                onChange={set("district")}
                disabled={!f.division}
                aria-invalid={!!errs.district}
              >
                <option value="">
                  {f.division ? "Select district" : "Select division first"}
                </option>
                {(DIVISIONS[f.division] || []).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {errs.district && <p className="error">{errs.district}</p>}
            </div>
          </div>
          <Field
            id="thana"
            label="Thana / Upazila"
            value={f.thana}
            onChange={set("thana")}
            error={errs.thana}
          />
          <div className="field">
            <label htmlFor="address">Full address</label>
            <textarea
              id="address"
              rows={3}
              value={f.address}
              onChange={set("address")}
              placeholder="House, road, area"
              autoComplete="street-address"
            />
            {errs.address && <p className="error">{errs.address}</p>}
          </div>
          <Field
            id="note"
            label="Order note (optional)"
            value={f.note}
            onChange={set("note")}
          />
          <button className="btn dark full">Continue</button>
        </form>
        <aside className="summary">
          <h2>Order summary</h2>
          {items.map((i) => (
            <div className="l" key={i.key}>
              <span>
                {i.name} ({i.color}, {i.size}) × {i.qty}
              </span>
              <span>{taka(i.price * i.qty)}</span>
            </div>
          ))}
          <hr />
          <div className="l">
            <span>Subtotal</span>
            <span>{taka(subtotal)}</span>
          </div>
          <p className="muted small">
            Delivery charge is shown in the next step.
          </p>
        </aside>
      </div>
    </div>
  );
}
