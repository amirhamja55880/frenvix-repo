"use client";
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("frx_cart")) || []);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("frx_cart", JSON.stringify(items));
  }, [items, ready]);

  const add = (i) =>
    setItems((c) => {
      const key = `${i.slug}-${i.color}-${i.size}`;
      return c.some((x) => x.key === key)
        ? c.map((x) => (x.key === key ? { ...x, qty: x.qty + i.qty } : x))
        : [...c, { ...i, key }];
    });
  const setQty = (key, q) =>
    setItems((c) =>
      c.map((x) => (x.key === key ? { ...x, qty: Math.max(1, q) } : x)),
    );
  const remove = (key) => setItems((c) => c.filter((x) => x.key !== key));
  const clear = () => setItems([]);
  const count = items.reduce((a, i) => a + i.qty, 0);
  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  return (
    <Ctx.Provider
      value={{ items, add, setQty, remove, clear, count, subtotal, ready }}
    >
      {children}
    </Ctx.Provider>
  );
}
