import { getSettings } from "@/lib/data";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  await connectDB();
  const st = await Settings.findOne({ key: "main" }).select("allowOrderDelete").lean(); // read straight from the database, not the cache
  return <><h1>Settings</h1><SettingsForm initial={{ ...(await getSettings()), allowOrderDelete: Boolean(st?.allowOrderDelete) }} /></>;
}
