import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import AdminNav from "./AdminNav";

export default async function PanelLayout({ children }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="adm">
      <AdminNav email={admin.email} />
      <div className="adm-main">{children}</div>
    </div>
  );
}
