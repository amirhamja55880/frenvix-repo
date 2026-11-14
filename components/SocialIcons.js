import { waLink } from "@/lib/contact";

const base = { viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": "true", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export const FacebookIcon = () => <svg {...base} stroke="none" fill="currentColor"><path d="M14.5 21v-8h2.7l.5-3.3h-3.2V7.6c0-.9.4-1.6 1.7-1.6h1.6V3.1C17.1 3 16.2 3 15.2 3 12.9 3 11.2 4.4 11.2 7.2v2.5H8.5V13h2.7v8z" /></svg>;
export const InstagramIcon = () => <svg {...base}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" /></svg>;
export const WhatsAppIcon = () => <svg {...base}><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z" fill="currentColor" stroke="none" /></svg>;
export const PhoneIcon = () => <svg {...base}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>;
export const MailIcon = () => <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
export const PinIcon = () => <svg {...base}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
export const ClockIcon = () => <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;

// Round Facebook / Instagram / WhatsApp buttons. Only the ones that have a link in Admin > Settings are shown.
export function SocialLinks({ s, colored = false }) {
  const list = [];
  if (s.facebook) list.push(["fb", "Facebook", s.facebook, <FacebookIcon key="f" />]);
  if (s.instagram) list.push(["ig", "Instagram", s.instagram, <InstagramIcon key="i" />]);
  if (s.whatsapp) list.push(["wa", "WhatsApp", waLink(s.whatsapp), <WhatsAppIcon key="w" />]);
  if (!list.length) return null;
  return (
    <div className={`soc ${colored ? "color" : ""}`}>
      {list.map(([c, label, href, icon]) => <a key={c} className={c} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>{icon}</a>)}
    </div>
  );
}
