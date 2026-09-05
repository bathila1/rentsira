import { getSiteSettings } from "@/utils/site-settings.server";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Site Settings" };

// Flags must never be served from a stale cache inside the admin panel.
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div style={{ padding: "40px", maxWidth: "820px" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "8px",
          }}
        >
          Site Settings
        </h1>
        <p style={{ color: "#64748b" }}>
          Feature switches for the live site. Changes take effect immediately.
        </p>
      </header>

      <SettingsForm initial={settings} />
    </div>
  );
}
