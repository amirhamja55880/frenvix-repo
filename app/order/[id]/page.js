"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { taka } from "@/lib/products";
import CopyButton from "@/components/CopyButton";

export default function OrderDone({ params }) {
  const [o, setO] = useState(undefined);
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
  return (
    <div className="wrap section narrow">
      <span className="pill">Pending</span>
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
        Your order is pending. One of our representatives will contact you
        shortly. A confirmation was sent to {o.email}.
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
            {cod ? "Cash on delivery" : `${o.paymentMethod} (to be confirmed)`}
          </span>
        </div>
        <div className="l total">
          <span>{cod ? "Pay on delivery" : "Total"}</span>
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
