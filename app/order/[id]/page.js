"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { taka } from "@/lib/products";
import CopyButton from "@/components/CopyButton";
import { useCart } from "@/components/CartProvider";
import { track } from "@/lib/track";

export default function OrderDone({ params }) {
  const [o, setO] = useState(undefined);
  const { clear } = useCart();
  const [paidNow, setPaidNow] = useState(false);
  useEffect(() => {
    try {
      setO(
        JSON.parse(localStorage.getItem("frx_orders") || "[]").find(
          (x) => x.id === params.id,
        ) || null,
      );
    } catch {
      setO(null);
    }
  }, [params.id]);
  useEffect(() => {
    if (!o) return;
    const paid = new URLSearchParams(window.location.search).get("paid") === "1";
    if (paid) {
      // Back from SSLCommerz after a verified payment.
      setPaidNow(true);
      clear();
      try { sessionStorage.removeItem("frx_checkout"); } catch {}
    }
    if ((o.paymentMethod || "COD") === "COD" || paid) track.purchase(o);
  }, [o]); // eslint-disable-line react-hooks/exhaustive-deps
  if (o === undefined) return <div className="wrap section" />;
  if (!o)
    return (
      <div className="wrap section empty">
        <h1 className="pagetitle">Order not found</h1>
        <Link className="btn dark" href="/track">
          Track an order
        </Link>
      </div>
    );
  const cod = (o.paymentMethod || "COD") === "COD";
  const online = o.paymentMethod === "Online";
  const paid = online && (paidNow || o.paymentStatus === "Paid");
  return (
    <div className="wrap section narrow">
      <span className="pill">{paid ? "Paid" : online ? "Awaiting payment" : "Pending"}</span>
      <h1 className="pagetitle">Thank you, {o.name.split(" ")[0]}</h1>
      <div className="idbox">
        <span className="muted small">Your order ID</span>
        <b className="idtext">{o.id}</b>
        <CopyButton text={o.id} />
      </div>
      <p className="muted small">
        Keep this ID and your phone number to track your order.
      </p>
      <p className="note">
        {paid
          ? `Payment received. Our team will confirm your order shortly. A confirmation was sent to ${o.email}.`
          : online
            ? "We have not received your payment yet. If you already paid, please wait a few minutes and check your email."
            : `Your order is pending. One of our representatives will contact you shortly. A confirmation was sent to ${o.email}.`}
      </p>
      <div className="summary">
        {o.items.map((i, k) => (
          <div className="l" key={k}>
            <span>
              {i.name} ({i.color}, {i.size}) × {i.qty}
            </span>
            <span>{taka(i.price * i.qty)}</span>
          </div>
        ))}
        <hr />
        <div className="l">
          <span>Delivery</span>
          <span>{taka(o.fee)}</span>
        </div>
        <div className="l">
          <span>Payment</span>
          <span>
            {cod ? "Cash on delivery" : online ? (paid ? "Paid online" : "Online payment (awaiting)") : `${o.paymentMethod} (to be confirmed)`}
          </span>
        </div>
        <div className="l total">
          <span>{cod ? "Pay on delivery" : paid ? "Total paid" : "Total"}</span>
          <span>{taka(o.total)}</span>
        </div>
      </div>
      <div className="actions" style={{ marginTop: 24 }}>
        <Link className="btn dark" href={`/track?id=${o.id}`}>
          Track this order
        </Link>
        <Link className="btn outline" href="/shop">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
