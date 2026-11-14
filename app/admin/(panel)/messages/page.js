import Link from "next/link";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { fmtDate } from "@/lib/admin";
import MessageActions from "./MessageActions";

export default async function Messages({ searchParams }) {
  const status = ["New", "Done"].includes(searchParams?.status) ? searchParams.status : "";
  await connectDB();
  const [list, nNew, nDone] = await Promise.all([
    Message.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(200).lean(),
    Message.countDocuments({ status: "New" }),
    Message.countDocuments({ status: "Done" }),
  ]);
  return (
    <>
      <h1>Messages</h1>
      <p className="muted" style={{ marginTop: -10, marginBottom: 16 }}>Messages sent from the Contact page. You also get each one by email.</p>
      <div className="chips" style={{ marginBottom: 16 }}>
        <Link className={`chip ${!status ? "on" : ""}`} href="/admin/messages">All ({nNew + nDone})</Link>
        <Link className={`chip ${status === "New" ? "on" : ""}`} href="/admin/messages?status=New">New ({nNew})</Link>
        <Link className={`chip ${status === "Done" ? "on" : ""}`} href="/admin/messages?status=Done">Done ({nDone})</Link>
      </div>
      {list.map((m) => (
        <details className="panel msg" key={String(m._id)} open={m.status === "New" && list.length <= 3}>
          <summary>
            <span className={`pill2 ${m.status === "New" ? "st-Pending" : "st-Delivered"}`}>{m.status}</span>
            <b>{m.name}</b><span className="muted"> · {m.subject}</span>
            <span className="muted small" style={{ marginLeft: "auto" }}>{fmtDate(m.createdAt)}</span>
          </summary>
          <div className="msgbody">
            <p className="small" style={{ lineHeight: 1.8 }}>
              {m.phone && <>Phone: <a className="link" href={`tel:${m.phone}`}>{m.phone}</a><br /></>}
              {m.email && <>Email: <a className="link" href={`mailto:${m.email}`}>{m.email}</a><br /></>}
              {m.orderId && <>Order: <Link className="link" href={`/admin/orders/${m.orderId}`}>{m.orderId}</Link></>}
            </p>
            <div className="note" style={{ whiteSpace: "pre-wrap" }}>{m.message}</div>
            <MessageActions id={String(m._id)} status={m.status} />
          </div>
        </details>
      ))}
      {!list.length && <p className="muted">No messages yet.</p>}
    </>
  );
}
