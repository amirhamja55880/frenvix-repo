import { SOCIAL } from "@/lib/social";
import { SITE } from "@/lib/products";

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ICONS = {
  facebook: (
    <svg {...svg}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  instagram: (
    <svg {...svg}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  ),
  tiktok: (
    <svg {...svg}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  ),
  gmail: (
    <svg {...svg}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
};

export default function SocialLinks({ email = SITE.email, className = "" }) {
  const list = [
    ["facebook", "Facebook", SOCIAL.facebook],
    ["instagram", "Instagram", SOCIAL.instagram],
    ["tiktok", "TikTok", SOCIAL.tiktok],
    ["gmail", "Gmail", email ? `mailto:${email}` : ""],
  ];
  return (
    <div className={`social ${className}`}>
      {list.map(([id, label, href]) => (
        <a
          key={id}
          href={href || undefined}
          aria-label={label}
          title={label}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className={href ? "" : "off"}
        >
          {ICONS[id]}
        </a>
      ))}
    </div>
  );
}
