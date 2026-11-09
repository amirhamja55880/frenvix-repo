"use client";
import { createContext, useContext } from "react";

const Ctx = createContext({
  homeDistrict: "Khulna",
  deliveryInsideKhulna: 60,
  deliveryOutsideKhulna: 120,
});
export const useSite = () => useContext(Ctx);

export default function SiteProvider({ settings, children }) {
  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}
