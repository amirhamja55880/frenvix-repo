// Moving announcement bar at the top of every page. Messages come from Admin > Settings.
export default function Ticker({ items }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  const reps = Math.max(2, Math.ceil(8 / list.length)); // enough copies to fill wide screens
  const width = list.reduce((a, t) => a + t.length * 7.2 + 80, 0) * reps;
  const seconds = Math.max(20, Math.round(width / 55));
  const row = (k) => (
    <div className="tk-row" key={k} aria-hidden={k > 0 ? "true" : undefined}>
      {Array.from({ length: reps }).flatMap((_, r) => list.map((t, i) => <span key={`${r}-${i}`}>{t}</span>))}
    </div>
  );
  return (
    <div className="topbar ticker" role="region" aria-label="Announcements">
      <div className="tk-track" style={{ animationDuration: `${seconds}s` }}>{row(0)}{row(1)}</div>
    </div>
  );
}
