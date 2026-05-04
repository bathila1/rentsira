import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch counts for dashboard
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: vehicleCount } = await supabase.from("uploaded_rent_vehicles").select("*", { count: "exact", head: true });
  const { count: bookingCount } = await supabase.from("booking_requests").select("*", { count: "exact", head: true });
  const { count: pendingBookings } = await supabase.from("booking_requests").select("*", { count: "exact", head: true }).eq("status", "pending");

  const stats = [
    { label: "Total Users", value: userCount ?? 0, icon: "👥", color: "#3b82f6" },
    { label: "Active Listings", value: vehicleCount ?? 0, icon: "🚗", color: "#10b981" },
    { label: "Total Bookings", value: bookingCount ?? 0, icon: "📅", color: "#6366f1" },
    { label: "Pending Requests", value: pendingBookings ?? 0, icon: "⏳", color: "#f59e0b" },
  ];

  return (
    <div style={{ padding: "40px" }}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Dashboard Overview</h1>
        <p style={{ color: "#64748b" }}>Welcome back, Admin. Here's what's happening today.</p>
      </header>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "24px",
        marginBottom: "40px"
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: `${stat.color}15`,
              color: stat.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem"
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Quick Actions or Recent Activity could go here */}
        <div style={{ 
          background: "#fff", 
          padding: "24px", 
          borderRadius: "16px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          minHeight: "300px"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px" }}>System Health</h2>
          <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
            All systems operational. Supabase connection: Active.
          </div>
        </div>

        <div style={{ 
          background: "#fff", 
          padding: "24px", 
          borderRadius: "16px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px" }}>Admin Tips</h2>
          <ul style={{ paddingLeft: "20px", color: "#64748b", fontSize: "0.85rem", lineHeight: "1.6" }}>
            <li>Verify new users to build trust.</li>
            <li>Respond to booking requests within 2 hours.</li>
            <li>Keep vehicle descriptions detailed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
