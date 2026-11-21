// Shows a product description with paragraphs, bullet lists and **bold** text.
// It builds normal page elements (no raw HTML), so whatever is typed in Admin stays safe.
const bold = (line) =>
  line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part) ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );

export default function Description({ text }) {
  const blocks = [];
  for (const raw of String(text || "").replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^[*\-•]\s+(.*)$/); // a line starting with "- " or "* " is a bullet
    const last = blocks[blocks.length - 1];
    if (m) last?.type === "ul" ? last.items.push(m[1]) : blocks.push({ type: "ul", items: [m[1]] });
    else blocks.push({ type: "p", text: line });
  }
  return (
    <div className="desc">
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i}>{b.items.map((t, j) => <li key={j}>{bold(t)}</li>)}</ul>
        ) : (
          <p key={i}>{bold(b.text)}</p>
        )
      )}
    </div>
  );
}
