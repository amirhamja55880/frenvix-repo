import { getSettings } from "@/lib/data";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  return <><h1>Settings</h1><SettingsForm initial={await getSettings()} /></>;
}
