"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/utils/supabase";

type BookingStatus = "pending" | "confirmed" | "rejected" | "completed";

type BookingRequest = {
  id: string;
  created_at: string;
  renter_name: string;
  renter_phone: string;
  renter_email: string | null;
  vehicle_type: string;
  pickup_district: string;
  pickup_date: string;
  return_date: string;
  with_driver: boolean;
  seat_count: number | null;
  notes: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  user_id: string | null;
};

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    next: BookingStatus[];
  }
> = {
  pending: {
    label: "Pending",
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fcd34d",
    dot: "#f59e0b",
    next: ["confirmed", "rejected"],
  },
  confirmed: {
    label: "Confirmed",
    color: "#065f46",
    bg: "#d1fae5",
    border: "#6ee7b7",
    dot: "#10b981",
    next: ["completed", "rejected"],
  },
  rejected: {
    label: "Rejected",
    color: "#7f1d1d",
    bg: "#fee2e2",
    border: "#fca5a5",
    dot: "#ef4444",
    next: ["pending"],
  },
  completed: {
    label: "Completed",
    color: "#1e3a5f",
    bg: "#dbeafe",
    border: "#93c5fd",
    dot: "#3b82f6",
    next: [],
  },
};

const PAGE_SIZE = 20;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(a: string, b: string) {
  return Math.ceil(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000,
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [driverFilter, setDriverFilter] = useState<"all" | "yes" | "no">("all");
  const [sortBy, setSortBy] = useState<
    "created_at" | "pickup_date" | "renter_name"
  >("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  const fetchCounts = useCallback(async () => {
    const statuses: BookingStatus[] = ["pending", "confirmed", "rejected", "completed"];
    const results = await Promise.all(
      statuses.map((s) =>
        supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", s)
      )
    );
    const counts: Record<string, number> = {};
    statuses.forEach((s, i) => {
      counts[s] = results[i].count ?? 0;
    });
    setStatusCounts(counts);
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("booking_requests")
      .select("*", { count: "exact" })
      .order(sortBy, { ascending: sortDir === "asc" })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (driverFilter === "yes") query = query.eq("with_driver", true);
    if (driverFilter === "no") query = query.eq("with_driver", false);
    if (search.trim()) {
      query = query.or(
        `renter_name.ilike.%${search.trim()}%,renter_phone.ilike.%${search.trim()}%,pickup_district.ilike.%${search.trim()}%,vehicle_type.ilike.%${search.trim()}%`
      );
    }

    const { data, count, error } = await query;
    if (!error) {
      setBookings((data as BookingRequest[]) ?? []);
      setTotal(count ?? 0);
    } else {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  }, [page, statusFilter, driverFilter, sortBy, sortDir, search]);

  useEffect(() => {
    fetchBookings();
    fetchCounts();
  }, [fetchBookings, fetchCounts]);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdatingStatus(id + status);
    // Note: Added .select() to ensure RLS doesn't silently block the update
    const { error, data } = await supabase
      .from("booking_requests")
      .update({ status })
      .eq("id", id)
      .select();

    setUpdatingStatus(null);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    if (!data || data.length === 0) {
      showToast("Update blocked by RLS policies.", "error");
      return;
    }

    showToast(`Status updated to ${status}`);
    fetchBookings();
    fetchCounts();
    if (selected?.id === id) {
      setSelected({ ...selected, status });
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    const { error, data } = await supabase
      .from("booking_requests")
      .update({ admin_notes: adminNotes })
      .eq("id", selected.id)
      .select();
    
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }

    if (!data || data.length === 0) {
      showToast("Note save blocked by RLS policies.", "error");
      return;
    }

    setSaveMsg("Saved!");
    setBookings((prev) =>
      prev.map((b) => (b.id === selected.id ? { ...b, admin_notes: adminNotes } : b))
    );
    setTimeout(() => setSaveMsg(""), 2500);
  }

  function openDetail(b: BookingRequest) {
    setSelected(b);
    setAdminNotes(b.admin_notes ?? "");
    setSaveMsg("");
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const allCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: "40px" }}>
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "success" ? "#10b981" : "#ef4444" }}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <header style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Booking Requests</h1>
            <p style={{ color: "#64748b" }}>Manage and respond to rental requests.</p>
          </div>
          <button style={styles.refreshBtn} onClick={() => { fetchBookings(); fetchCounts(); }}>↻ Refresh</button>
        </div>

        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
          {(
            [
              ["all", allCount, "#64748b"],
              ["pending", statusCounts.pending ?? 0, "#f59e0b"],
              ["confirmed", statusCounts.confirmed ?? 0, "#10b981"],
              ["rejected", statusCounts.rejected ?? 0, "#ef4444"],
              ["completed", statusCounts.completed ?? 0, "#3b82f6"],
            ] as const
          ).map(([s, n, col]) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s as BookingStatus | "all"); setPage(1); }}
              style={{
                ...styles.statChip,
                borderColor: statusFilter === s ? col : "#e2e8f0",
                background: statusFilter === s ? `${col}10` : "#fff",
                color: statusFilter === s ? col : "#64748b",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{s === "all" ? "All Bookings" : s}</span>
              <span style={{
                background: statusFilter === s ? col : "#f1f5f9",
                color: statusFilter === s ? "#fff" : "#64748b",
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700
              }}>{n}</span>
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input
          style={styles.searchInput}
          placeholder="Search renter, phone, district..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          style={styles.select}
          value={driverFilter}
          onChange={(e) => { setDriverFilter(e.target.value as "all" | "yes" | "no"); setPage(1); }}
        >
          <option value="all">All Service Types</option>
          <option value="yes">With Driver</option>
          <option value="no">Self Drive</option>
        </select>
        <select
          style={styles.select}
          value={`${sortBy}_${sortDir}`}
          onChange={(e) => {
            const [col, dir] = e.target.value.split("_") as [typeof sortBy, typeof sortDir];
            setSortBy(col);
            setSortDir(dir);
            setPage(1);
          }}
        >
          <option value="created_at_desc">Newest First</option>
          <option value="created_at_asc">Oldest First</option>
          <option value="pickup_date_asc">Pickup Date ↑</option>
        </select>
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>No bookings found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                  <th style={styles.th}>Renter</th>
                  <th style={styles.th}>Vehicle</th>
                  <th style={styles.th}>District</th>
                  <th style={styles.th}>Dates</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{b.renter_name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{b.renter_phone}</div>
                    </td>
                    <td style={styles.td}>{b.vehicle_type}</td>
                    <td style={styles.td}>{b.pickup_district}</td>
                    <td style={styles.td}>
                      <div style={{ fontSize: "0.85rem" }}>{formatDate(b.pickup_date)}</div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{daysBetween(b.pickup_date, b.return_date)} days</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: STATUS_CONFIG[b.status].bg,
                        color: STATUS_CONFIG[b.status].color,
                        border: `1px solid ${STATUS_CONFIG[b.status].border}`
                      }}>{STATUS_CONFIG[b.status].label}</span>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => openDetail(b)} style={styles.viewBtn}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}>Prev</button>
          <span style={{ alignSelf: "center", fontSize: "0.9rem", color: "#64748b" }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}>Next</button>
        </div>
      )}

      {selected && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div style={styles.modal}>
            <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Booking Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <div>
                  <h3 style={styles.sectionTitle}>Renter Info</h3>
                  <p><strong>Name:</strong> {selected.renter_name}</p>
                  <p><strong>Phone:</strong> {selected.renter_phone}</p>
                  <p><strong>Email:</strong> {selected.renter_email || "N/A"}</p>
                </div>
                <div>
                  <h3 style={styles.sectionTitle}>Rental Info</h3>
                  <p><strong>Vehicle:</strong> {selected.vehicle_type}</p>
                  <p><strong>District:</strong> {selected.pickup_district}</p>
                  <p><strong>Dates:</strong> {formatDate(selected.pickup_date)} - {formatDate(selected.return_date)}</p>
                </div>
              </div>

              {selected.notes && (
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={styles.sectionTitle}>Renter Notes</h3>
                  <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.9rem" }}>{selected.notes}</div>
                </div>
              )}

              <div style={{ marginBottom: "32px" }}>
                <h3 style={styles.sectionTitle}>Admin Notes</h3>
                <textarea 
                  style={styles.textarea} 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)} 
                  placeholder="Internal notes..."
                />
                <button onClick={saveNotes} disabled={saving} style={styles.saveBtn}>{saving ? "Saving..." : "Save Notes"}</button>
                {saveMsg && <span style={{ marginLeft: "12px", color: "#10b981", fontSize: "0.85rem" }}>{saveMsg}</span>}
              </div>

              <div>
                <h3 style={styles.sectionTitle}>Update Status</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {STATUS_CONFIG[selected.status].next.map(status => (
                    <button 
                      key={status} 
                      onClick={() => updateStatus(selected.id, status)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: STATUS_CONFIG[status].dot,
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: updatingStatus === selected.id + status ? 0.7 : 1
                      }}
                      disabled={!!updatingStatus}
                    >
                      {updatingStatus === selected.id + status ? "Updating..." : `Mark as ${STATUS_CONFIG[status].label}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  refreshBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" },
  statChip: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 16px", borderRadius: "12px", border: "1px solid", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", background: "#fff" },
  searchInput: { flex: 1, padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none" },
  select: { padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9rem", background: "#fff", outline: "none", cursor: "pointer" },
  tableCard: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  th: { padding: "16px", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" },
  td: { padding: "16px", fontSize: "0.9rem", color: "#334155" },
  viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
  pageBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" },
  modal: { background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" },
  sectionTitle: { fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "12px" },
  textarea: { width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.9rem", marginBottom: "12px", outline: "none" },
  saveBtn: { padding: "8px 16px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", fontWeight: 600, cursor: "pointer" },
  toast: { position: "fixed", top: "24px", right: "24px", padding: "12px 24px", borderRadius: "12px", color: "#fff", fontWeight: 600, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 1000 }
};
