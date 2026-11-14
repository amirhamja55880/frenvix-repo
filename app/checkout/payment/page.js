"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { PAYMENT_METHODS, taka } from "@/lib/products";
import { useSite } from "@/components/SiteProvider";
import CopyButton from "@/components/CopyButton";

export default function Payment() {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const site = useSite();
  const [info, setInfo] = useState(undefined);
  const [method, setMethod] = useState("COD");
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const placed = useRef(false);
  const [notice, setNotice] = useState("");
  const [payNumber, setPayNumber] = useState("");
  const [trxId, setTrxId] = useState("");

  useEffect(() => {
    try {
      setInfo(JSON.parse(sessionStorage.getItem("frx_checkout")) || null);
    } catch {
      setInfo(null);
    }
  }, []);
  useEffect(() => {
    const st = new URLSearchParams(window.location.search).get("status");
    if (st === "failed") setNotice("Your payment could not be confirmed, so no money was taken for this order. Please try again or choose cash on delivery.");
    if (st === "fail") setNotice("The payment failed. Please try again or choose cash on delivery.");
    if (st === "cancel") setNotice("You cancelled the payment. Your cart is still here if you want to try again.");
  }, []);
  useEffect(() => {
    if (info === null) router.replace("/checkout");
  }, [info, router]);

  if (!ready || !info || placed.current)
    return <div className="wrap section" />;
  if (!items.length)
    return (
      <div className="wrap section empty">
        <h1 className="pagetitle">Your cart is empty</h1>
        <Link className="btn dark" href="/shop">
          Browse products
        </Link>
      </div>
    );

  const inside = info.district === site.homeDistrict;
  const fee = inside ? site.deliveryInsideKhulna : site.deliveryOutsideKhulna;
  const numberOf = (m) => (m?.manual ? site[m.id.toLowerCase() + "Number"] : "");
  const methods = PAYMENT_METHODS.filter((m) => (m.online ? site.onlinePayment : m.manual ? Boolean(numberOf(m)) : true));
  const chosen = methods.find((m) => m.id === method);

  const place = async () => {
    if (chosen?.manual) {
      if (!/^01[3-9]\d{8}\d?$/.test(payNumber.trim())) return setFail(`Enter the ${chosen.id} number you sent the money from.`);
      if (!/^[A-Za-z0-9]{6,20}$/.test(trxId.trim())) return setFail("Enter the Transaction ID (TrxID) from your payment message.");
    }
    setBusy(true);
    setFail("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...info, paymentMethod: method, payNumber: payNumber.trim(), trxId: trxId.trim(), items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      const all = JSON.parse(localStorage.getItem("frx_orders") || "[]");
      localStorage.setItem("frx_orders", JSON.stringify([...all, data.order]));
      if (data.gatewayUrl) {
        // Online payment: keep the cart until the payment succeeds, then go to the SSLCommerz page.
        window.location.href = data.gatewayUrl;
        return;
      }
      placed.current = true;
      sessionStorage.removeItem("frx_checkout");
      clear();
      router.push(`/order/${data.order.id}`);
    } catch (err) {
      setFail(err.message + ". Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="wrap section">
      <div className="steps">
        <span>1. Delivery details</span>
        <span>›</span>
        <b>2. Delivery charge &amp; payment</b>
      </div>
      <h1 className="pagetitle">Delivery charge &amp; payment</h1>
      <div className="two">
        <div>
          <div className="note" style={{ marginTop: 0 }}>
            <b>Deliver to</b> ·{" "}
            <Link className="link" href="/checkout">
              Edit
            </Link>
            <br />
            {info.name} · {info.phone}
            <br />
            {info.address}, {info.thana}, {info.district}, {info.division}
          </div>
          <h2 className="subhead">Delivery charge</h2>
          <div className={`feerow ${inside ? "on" : ""}`}>
            <span>Inside Khulna</span>
            <b>{taka(site.deliveryInsideKhulna)}</b>
          </div>
          <div className={`feerow ${!inside ? "on" : ""}`}>
            <span>Outside Khulna</span>
            <b>{taka(site.deliveryOutsideKhulna)}</b>
          </div>
          <p className="muted small">
            Your district is {info.district}, so your delivery charge is{" "}
            <b>{taka(fee)}</b>.
          </p>
          <h2 className="subhead">Payment method</h2>
          {methods.map((m) => (
            <label key={m.id} className={`pay ${method === m.id ? "on" : ""}`}>
              <input
                type="radio"
                name="pay"
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
              />
              <span>
                {m.label}
              </span>
            </label>
          ))}
          {chosen?.online && (
            <p className="note">
              You will go to the secure SSLCommerz page to pay with bKash,
              Nagad, Rocket, a card or net banking. Your order is confirmed
              after the payment succeeds.
            </p>
          )}
          {chosen?.manual && (
            <div className="note">
              <b>How to pay with {chosen.id}</b>
              <ol style={{ margin: "8px 0 12px 18px", padding: 0 }}>
                <li>Open your {chosen.id} app and choose <b>Send Money</b>.</li>
                <li>
                  Send exactly <b>{taka(subtotal + fee)}</b> to <b>{numberOf(chosen)}</b> <CopyButton text={numberOf(chosen)} label="Copy number" />
                </li>
                <li>Type the number you sent from and the Transaction ID below. We verify it before we confirm your order.</li>
              </ol>
              <div className="field">
                <label htmlFor="pn">Your {chosen.id} number (sent from)</label>
                <input id="pn" value={payNumber} onChange={(e) => setPayNumber(e.target.value)} inputMode="numeric" maxLength={12} placeholder="01XXXXXXXXX" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="tx">Transaction ID (TrxID)</label>
                <input id="tx" value={trxId} onChange={(e) => setTrxId(e.target.value)} maxLength={20} autoCapitalize="characters" placeholder="e.g. 8N7A6D5EE3" />
              </div>
            </div>
          )}
          {notice && (
            <p className="error" role="alert">
              {notice}
            </p>
          )}
          {fail && (
            <p className="error" role="alert">
              {fail}
            </p>
          )}
        </div>
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
          <div className="l">
            <span>Delivery</span>
            <span>{taka(fee)}</span>
          </div>
          <div className="l total">
            <span>Total</span>
            <span>{taka(subtotal + fee)}</span>
          </div>
          <button className="btn dark full" onClick={place} disabled={busy}>
            {busy ? (method === "Online" ? "Opening payment page…" : "Placing order…") : method === "Online" ? "Pay now" : "Place order"}
          </button>
        </aside>
      </div>
    </div>
  );
}
