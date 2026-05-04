import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = "admin@siraa.lk";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/unauthorized");
  }

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{
        width: "260px",
        background: "#0f172a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh"
      }}>
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/admin" style={{ 
            fontSize: "1.5rem", 
            fontWeight: 800, 
            color: "#fff", 
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            SIRAA <span style={{ fontSize: "0.8rem", background: "#ef4444", padding: "2px 6px", borderRadius: "4px" }}>ADMIN</span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "20px 0" }}>
          <SidebarLink href="/admin" icon="📊" label="Dashboard" />
          <SidebarLink href="/admin/bookings" icon="📅" label="Bookings" />
          <SidebarLink href="/admin/users" icon="👥" label="Users" />
          <SidebarLink href="/admin/vehicles" icon="🚗" label="Vehicles" />
        </nav>

        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "8px" }}>Logged in as</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
          <Link href="/" style={{ display: "block", marginTop: "16px", color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem" }}>
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: "260px", flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 24px",
      color: "#cbd5e1",
      textDecoration: "none",
      fontSize: "0.95rem",
      transition: "all 0.2s"
    }}>
      <span style={{ fontSize: "1.1rem" }}>{icon}</span>
      {label}
    </Link>
  );
}
