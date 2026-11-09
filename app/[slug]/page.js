// import { notFound } from "next/navigation";
// import { getSettings } from "@/lib/data";
// import { SITE } from "@/lib/products";

// const titles = {
//   about: "About",
//   contact: "Contact",
//   "return-policy": "Return policy",
// };
// export const generateMetadata = ({ params }) => ({
//   title: titles[params.slug],
// });

// export default async function Info({ params }) {
//   const t = titles[params.slug];
//   if (!t) notFound();
//   const s = await getSettings();
//   const body = {
//     about: [
//       `${SITE.name} makes everyday layers: hoodies, sweatshirts and henleys cut from heavy cotton and finished to last.`,
//       "We start with a small range and add new styles as we grow.",
//     ],
//     contact: [
//       `Questions about an order or a size? Call or message ${s.phone}, or email ${s.email}.`,
//       "We reply within one working day.",
//     ],
//     "return-policy": [
//       "If the size does not fit or the item is faulty, tell us within 3 days of delivery and we will arrange an exchange.",
//       "Items must be unworn and unwashed, with tags attached.",
//     ],
//   }[params.slug];
//   return (
//     <div className="wrap section narrow">
//       <h1 className="pagetitle">{t}</h1>
//       {body.map((x, i) => (
//         <p key={i} className="desc">
//           {x}
//         </p>
//       ))}
//     </div>
//   );
// }
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";
import SocialLinks from "@/components/SocialLinks";

const titles = {
  contact: "Contact",
  "return-policy": "Return policy",
};
export const generateMetadata = ({ params }) => ({
  title: titles[params.slug],
});

export default async function Info({ params }) {
  const t = titles[params.slug];
  if (!t) notFound();
  const s = await getSettings();
  const body = {
    contact: [
      `Questions about an order or a size? Call or message ${s.phone}, or email ${s.email}.`,
      "We reply within one working day.",
    ],
    "return-policy": [
      "If the size does not fit or the item is faulty, tell us within 3 days of delivery and we will arrange an exchange.",
      "Items must be unworn and unwashed, with tags attached.",
    ],
  }[params.slug];
  return (
    <div className="wrap section narrow">
      <h1 className="pagetitle">{t}</h1>
      {body.map((x, i) => (
        <p key={i} className="desc">
          {x}
        </p>
      ))}
      {params.slug === "contact" && <SocialLinks email={s.email} />}
    </div>
  );
}
