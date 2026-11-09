// Placeholder illustration used until real product photos are added.
export function garment(type, hex) {
  let s = `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg"><path d="M70 20 L40 30 L8 150 L34 160 L55 92 L55 205 L145 205 L145 92 L166 160 L192 150 L160 30 L130 20 Q100 44 70 20Z" fill="${hex}"/><path d="M8 150 L34 160 L38 140 L12 130Z M192 150 L166 160 L162 140 L188 130Z" fill="rgba(0,0,0,.2)"/>`;
  if (type === "Hoodie")
    s += `<path d="M68 22 Q100 -14 132 22 Q100 58 68 22Z" fill="rgba(0,0,0,.28)"/><path d="M75 150 L125 150 L132 185 L68 185Z" fill="rgba(0,0,0,.18)"/><path d="M92 46 V84 M108 46 V84" stroke="rgba(255,255,255,.55)" stroke-width="3"/>`;
  if (type === "Sweatshirt")
    s += `<path d="M70 20 Q100 44 130 20" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="9"/><rect x="55" y="192" width="90" height="13" fill="rgba(0,0,0,.2)"/>`;
  if (type === "Henley")
    s += `<path d="M70 20 Q100 44 130 20" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="6"/><rect x="95" y="44" width="10" height="44" fill="rgba(0,0,0,.22)"/><circle cx="100" cy="52" r="2.6" fill="#eee"/><circle cx="100" cy="66" r="2.6" fill="#eee"/><circle cx="100" cy="80" r="2.6" fill="#eee"/>`;
  return s + "</svg>";
}
