import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import AdminNav from "./AdminNav";

export default async function PanelLayout({ children }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  await connectDB();
  const newMessages = await Message.countDocuments({ status: "New" });
  return (
    <div className="adm">
      <AdminNav email={admin.email} newMessages={newMessages} />
      <div className="adm-main">{children}</div>
    </div>
  );
}
