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

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysBetween(a: string, b: string) {
  return Math.ceil(
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000,
  );
}

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminBookingsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auth guard ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (user?.email && user.email === adminEmail) setIsAdmin(true);
      setAuthChecked(true);
    });
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  // ── Fetch status counts ──
  const fetchCounts = useCallback(async () => {
    const statuses: BookingStatus[] = [
      "pending",
      "confirmed",
      "rejected",
      "completed",
    ];
    const results = await Promise.all(
      statuses.map((s) =>
        supabase
          .from("booking_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", s),
      ),
    );
    const counts: Record<string, number> = {};
    statuses.forEach((s, i) => {
      counts[s] = results[i].count ?? 0;
    });
    setStatusCounts(counts);
  }, []);

  // ── Fetch bookings ──
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
        `renter_name.ilike.%${search.trim()}%,renter_phone.ilike.%${search.trim()}%,pickup_district.ilike.%${search.trim()}%,vehicle_type.ilike.%${search.trim()}%`,
      );
    }

    const { data, count, error } = await query;
    if (!error) {
      setBookings((data as BookingRequest[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, statusFilter, driverFilter, sortBy, sortDir, search]);

  useEffect(() => {
    if (isAdmin) {
      fetchBookings();
      fetchCounts();
    }
  }, [isAdmin, fetchBookings, fetchCounts]);

  // ── Realtime subscription ──
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("booking_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_requests" },
        () => {
          fetchBookings();
          fetchCounts();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchBookings, fetchCounts]);

  // ── Status update ──
  async function updateStatus(id: string, status: BookingStatus) {
    setUpdatingStatus(id + status);
    const { error, data } = await supabase
      .from("booking_requests")
      .update({ status })
      .eq("id", id)
      .select(); // ← add this to confirm the row was actually updated

    setUpdatingStatus(null);

    if (error) {
      console.error("Update error:", error); // ← check browser console
      showToast("Failed to update status.", "error");
      return;
    }

    if (!data || data.length === 0) {
      // RLS blocked it silently — no error but no rows updated
      showToast("Update blocked — check RLS policies.", "error");
      return;
    }
    // ... rest of function
  }

  // ── Save admin notes ──
  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("booking_requests")
      .update({ admin_notes: adminNotes })
      .eq("id", selected.id);
    setSaving(false);
    if (!error) {
      setSaveMsg("Saved!");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selected.id ? { ...b, admin_notes: adminNotes } : b,
        ),
      );
      setTimeout(() => setSaveMsg(""), 2500);
    } else {
      showToast("Failed to save notes.", "error");
    }
  }

  function openDetail(b: BookingRequest) {
    setSelected(b);
    setAdminNotes(b.admin_notes ?? "");
    setSaveMsg("");
  }

  function handleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
    setPage(1);
  }

  if (!authChecked) return null;

  if (!isAdmin) {
    return (
      <main style={styles.denied}>
        <div style={{ textAlign: "center" }}>
          <div style={styles.lockIcon}>🔒</div>
          <h1 style={styles.deniedTitle}>Access Denied</h1>
          <p style={styles.deniedSub}>
            This page is restricted to administrators.
          </p>
        </div>
      </main>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const allCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <main style={styles.page}>
      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === "success" ? "#065f46" : "#7f1d1d",
          }}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <p style={styles.headerLabel}>Admin Panel</p>
            <h1 style={styles.headerTitle}>Booking Requests</h1>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.liveIndicator}>
              <span style={styles.liveDot} />
              Live
            </div>
            <button
              style={styles.refreshBtn}
              onClick={() => {
                fetchBookings();
                fetchCounts();
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div style={styles.statsStrip}>
          {(
            [
              ["all", allCount, "#6b7280"],
              ["pending", statusCounts.pending ?? 0, "#f59e0b"],
              ["confirmed", statusCounts.confirmed ?? 0, "#10b981"],
              ["rejected", statusCounts.rejected ?? 0, "#ef4444"],
              ["completed", statusCounts.completed ?? 0, "#3b82f6"],
            ] as const
          ).map(([s, n, col]) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s as BookingStatus | "all");
                setPage(1);
              }}
              style={{
                ...styles.statChip,
                borderColor: statusFilter === s ? col : "rgba(255,255,255,0.1)",
                background: statusFilter === s ? `${col}22` : "transparent",
                color: statusFilter === s ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              <span style={{ ...styles.statDot, background: col }} />
              <span style={{ textTransform: "capitalize" }}>
                {s === "all" ? "All" : s}
              </span>
              <span
                style={{
                  ...styles.statBadge,
                  background:
                    statusFilter === s ? col : "rgba(255,255,255,0.12)",
                  color: statusFilter === s ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {n}
              </span>
            </button>
          ))}
        </div>
      </header>

      <div style={styles.body}>
        {/* ── Toolbar ── */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search name, phone, district, vehicle…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                style={styles.clearBtn}
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                ✕
              </button>
            )}
          </div>
          <div style={styles.toolbarRight}>
            <select
              style={styles.select}
              value={driverFilter}
              onChange={(e) => {
                setDriverFilter(e.target.value as typeof driverFilter);
                setPage(1);
              }}
            >
              <option value="all">Any driver</option>
              <option value="yes">With driver</option>
              <option value="no">Self-drive</option>
            </select>
            <select
              style={styles.select}
              value={`${sortBy}_${sortDir}`}
              onChange={(e) => {
                const [col, dir] = e.target.value.split("_") as [
                  typeof sortBy,
                  typeof sortDir,
                ];
                setSortBy(col);
                setSortDir(dir);
                setPage(1);
              }}
            >
              <option value="created_at_desc">Newest first</option>
              <option value="created_at_asc">Oldest first</option>
              <option value="pickup_date_asc">Pickup ↑</option>
              <option value="pickup_date_desc">Pickup ↓</option>
              <option value="renter_name_asc">Name A–Z</option>
              <option value="renter_name_desc">Name Z–A</option>
            </select>
          </div>
        </div>

        {/* ── Results count ── */}
        <div style={styles.resultsMeta}>
          {loading
            ? "Loading…"
            : `${total} result${total !== 1 ? "s" : ""}${search ? ` for "${search}"` : ""}`}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}
            >
              Loading bookings…
            </span>
          </div>
        ) : bookings.length === 0 ? (
          <div style={styles.emptyWrap}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyText}>No bookings found</p>
            <p style={styles.emptyHint}>
              Try adjusting your filters or search term
            </p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <Th
                    onClick={() => handleSort("renter_name")}
                    sorted={sortBy === "renter_name"}
                    dir={sortDir}
                  >
                    Renter
                  </Th>
                  <Th>Vehicle</Th>
                  <Th>District</Th>
                  <Th
                    onClick={() => handleSort("pickup_date")}
                    sorted={sortBy === "pickup_date"}
                    dir={sortDir}
                  >
                    Dates
                  </Th>
                  <Th>Driver</Th>
                  <Th>Status</Th>
                  <Th
                    onClick={() => handleSort("created_at")}
                    sorted={sortBy === "created_at"}
                    dir={sortDir}
                  >
                    Submitted
                  </Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const cfg = STATUS_CONFIG[b.status];
                  const nights = daysBetween(b.pickup_date, b.return_date);
                  const isUpcoming = new Date(b.pickup_date) > new Date();
                  return (
                    <tr
                      key={b.id}
                      style={styles.tr}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={styles.td}>
                        <div style={styles.renterName}>{b.renter_name}</div>
                        <a
                          href={`tel:${b.renter_phone}`}
                          style={styles.renterPhone}
                        >
                          {b.renter_phone}
                        </a>
                        {b.renter_email && (
                          <a
                            href={`mailto:${b.renter_email}`}
                            style={styles.renterEmail}
                          >
                            {b.renter_email}
                          </a>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.vehicleType}>{b.vehicle_type}</div>
                        {b.seat_count && (
                          <div style={styles.vehicleSeat}>
                            {b.seat_count} seats
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.district}>{b.pickup_district}</span>
                      </td>
                      <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                        <div style={styles.dateMain}>
                          {formatDate(b.pickup_date)}
                        </div>
                        <div style={styles.dateSub}>
                          → {formatDate(b.return_date)}
                        </div>
                        <div
                          style={{
                            ...styles.dateDays,
                            color: isUpcoming ? "#10b981" : "#6b7280",
                          }}
                        >
                          {nights} day{nights !== 1 ? "s" : ""}
                          {isUpcoming ? " · upcoming" : ""}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        {b.with_driver ? (
                          <span style={styles.driverYes}>✓ Driver</span>
                        ) : (
                          <span style={styles.driverNo}>Self</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            color: cfg.color,
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                          }}
                        >
                          <span
                            style={{ ...styles.statusDot, background: cfg.dot }}
                          />
                          {cfg.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.timeAgo}>
                          {timeAgo(b.created_at)}
                        </div>
                        <div style={styles.dateSmall}>
                          {formatDate(b.created_at)}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.viewBtn}
                            onClick={() => openDetail(b)}
                          >
                            View
                          </button>
                          {cfg.next.map((ns) => {
                            const isLoading = updatingStatus === b.id + ns;
                            return (
                              <button
                                key={ns}
                                style={{
                                  ...styles.actionBtn,
                                  background: STATUS_CONFIG[ns].dot,
                                  opacity: isLoading ? 0.6 : 1,
                                }}
                                onClick={() => updateStatus(b.id, ns)}
                                disabled={!!updatingStatus}
                              >
                                {isLoading ? "…" : STATUS_CONFIG[ns].label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <div style={styles.pageNumbers}>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p =
                  totalPages <= 7
                    ? i + 1
                    : page <= 4
                      ? i + 1
                      : page >= totalPages - 3
                        ? totalPages - 6 + i
                        : page - 3 + i;
                return (
                  <button
                    key={p}
                    style={{
                      ...styles.pageNum,
                      ...(page === p ? styles.pageNumActive : {}),
                    }}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              style={styles.pageBtn}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
            <span style={styles.pageMeta}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}{" "}
              of {total}
            </span>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div style={styles.modal}>
            {/* Modal header */}
            <div style={styles.modalHeader}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={styles.modalTitle}>{selected.renter_name}</h2>
                <p style={styles.modalSub}>
                  Submitted {formatDateTime(selected.created_at)}
                </p>
              </div>
              <div style={styles.modalHeaderRight}>
                <span
                  style={{
                    ...styles.statusBadge,
                    color: STATUS_CONFIG[selected.status].color,
                    background: STATUS_CONFIG[selected.status].bg,
                    border: `1px solid ${STATUS_CONFIG[selected.status].border}`,
                  }}
                >
                  <span
                    style={{
                      ...styles.statusDot,
                      background: STATUS_CONFIG[selected.status].dot,
                    }}
                  />
                  {STATUS_CONFIG[selected.status].label}
                </span>
                <button
                  style={styles.closeBtn}
                  onClick={() => setSelected(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={styles.modalBody}>
              {/* Contact */}
              <ModalSection title="Contact">
                <DetailRow label="Name" value={selected.renter_name} />
                <DetailRow
                  label="Phone"
                  value={
                    <a
                      href={`tel:${selected.renter_phone}`}
                      style={{ color: "#ef4444", fontWeight: 600 }}
                    >
                      {selected.renter_phone}
                    </a>
                  }
                />
                {selected.renter_email && (
                  <DetailRow
                    label="Email"
                    value={
                      <a
                        href={`mailto:${selected.renter_email}`}
                        style={{ color: "#ef4444" }}
                      >
                        {selected.renter_email}
                      </a>
                    }
                  />
                )}
                {selected.user_id && (
                  <DetailRow
                    label="User ID"
                    value={
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          color: "#6b7280",
                        }}
                      >
                        {selected.user_id.slice(0, 8)}…
                      </span>
                    }
                  />
                )}
              </ModalSection>

              {/* Trip */}
              <ModalSection title="Trip Details">
                <DetailRow label="Vehicle" value={selected.vehicle_type} />
                <DetailRow label="District" value={selected.pickup_district} />
                <DetailRow
                  label="Pickup"
                  value={formatDate(selected.pickup_date)}
                />
                <DetailRow
                  label="Return"
                  value={formatDate(selected.return_date)}
                />
                <DetailRow
                  label="Duration"
                  value={`${daysBetween(selected.pickup_date, selected.return_date)} days`}
                />
                <DetailRow
                  label="With Driver"
                  value={selected.with_driver ? "✓ Yes" : "✗ No"}
                />
                {selected.seat_count && (
                  <DetailRow label="Seats" value={`${selected.seat_count}`} />
                )}
              </ModalSection>

              {/* Customer Notes */}
              {selected.notes && (
                <ModalSection title="Customer Notes">
                  <p style={styles.notesBox}>{selected.notes}</p>
                </ModalSection>
              )}

              {/* Admin Notes */}
              <ModalSection title="Admin Notes">
                <textarea
                  style={styles.adminTextarea}
                  rows={4}
                  placeholder="Vehicle found, price quoted, internal notes…"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 10,
                  }}
                >
                  <button
                    style={styles.saveBtn}
                    onClick={saveNotes}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Notes"}
                  </button>
                  {saveMsg && (
                    <span
                      style={{
                        color: "#10b981",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      ✓ {saveMsg}
                    </span>
                  )}
                </div>
              </ModalSection>

              {/* Status actions */}
              {STATUS_CONFIG[selected.status].next.length > 0 && (
                <ModalSection title="Update Status">
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {STATUS_CONFIG[selected.status].next.map((ns) => {
                      const isLoading = updatingStatus === selected.id + ns;
                      return (
                        <button
                          key={ns}
                          style={{
                            ...styles.statusActionBtn,
                            background: STATUS_CONFIG[ns].dot,
                            opacity: isLoading ? 0.6 : 1,
                          }}
                          onClick={() => updateStatus(selected.id, ns)}
                          disabled={!!updatingStatus}
                        >
                          {isLoading
                            ? "Updating…"
                            : `Mark as ${STATUS_CONFIG[ns].label}`}
                        </button>
                      );
                    })}
                  </div>
                </ModalSection>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </main>
  );
}

function Th({
  children,
  onClick,
  sorted,
  dir,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sorted?: boolean;
  dir?: "asc" | "desc";
}) {
  return (
    <th
      style={{
        ...styles.th,
        cursor: onClick ? "pointer" : "default",
        color: sorted ? "var(--neutral-800)" : "var(--neutral-500)",
        userSelect: "none",
      }}
      onClick={onClick}
    >
      {children}
      {sorted && (
        <span style={{ marginLeft: 4, fontSize: "0.7rem" }}>
          {dir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  );
}

function ModalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.modalSection}>
      <h3 style={styles.modalSectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

// ── Styles ──
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "var(--font-body, system-ui, sans-serif)",
  },
  denied: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
  },
  lockIcon: { fontSize: "3rem", marginBottom: 16 },
  deniedTitle: {
    fontFamily: "var(--font-display, serif)",
    fontSize: "1.5rem",
    color: "#0f172a",
    marginBottom: 8,
  },
  deniedSub: { color: "#64748b" },

  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 100,
    padding: "12px 20px",
    borderRadius: 10,
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.875rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    animation: "slideIn 0.3s ease",
  },

  header: {
    background: "#0f172a",
    borderBottom: "3px solid #ef4444",
    paddingBottom: 0,
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 32px 16px",
    flexWrap: "wrap",
    gap: 16,
  },
  headerLabel: {
    color: "#64748b",
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: "var(--font-display, serif)",
    fontSize: "1.75rem",
    color: "#fff",
    margin: 0,
  },
  headerActions: { display: "flex", alignItems: "center", gap: 12 },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#10b981",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
    animation: "pulse 2s infinite",
  },
  refreshBtn: {
    padding: "7px 16px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 500,
  },

  statsStrip: {
    display: "flex",
    gap: 8,
    padding: "12px 32px",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  statChip: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "7px 14px",
    borderRadius: 20,
    border: "1px solid",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  },
  statDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  statBadge: {
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: "0.75rem",
    fontWeight: 700,
  },

  body: { padding: "24px 32px", maxWidth: 1400, margin: "0 auto" },

  toolbar: {
    display: "flex",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: { position: "relative", flex: 1, minWidth: 200 },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.1rem",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "9px 36px 9px 38px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
    color: "#0f172a",
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#94a3b8",
    fontSize: "0.75rem",
  },
  toolbarRight: { display: "flex", gap: 10 },
  select: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    fontSize: "0.85rem",
    color: "#374151",
    cursor: "pointer",
    outline: "none",
  },

  resultsMeta: {
    fontSize: "0.82rem",
    color: "#64748b",
    marginBottom: 10,
    fontWeight: 500,
  },

  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "80px 0",
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTopColor: "#ef4444",
    animation: "spin 0.7s linear infinite",
  },
  emptyWrap: { textAlign: "center", padding: "80px 0" },
  emptyIcon: { fontSize: "2.5rem", marginBottom: 12 },
  emptyText: {
    color: "#374151",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: 6,
  },
  emptyHint: { color: "#94a3b8", fontSize: "0.875rem" },

  tableWrap: {
    overflowX: "auto",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  thead: { borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f8fafc",
    transition: "background 0.1s",
    cursor: "default",
  },
  td: { padding: "13px 16px", verticalAlign: "middle" },

  renterName: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: "0.9rem",
    marginBottom: 2,
  },
  renterPhone: {
    display: "block",
    color: "#ef4444",
    fontSize: "0.8rem",
    textDecoration: "none",
    fontWeight: 500,
  },
  renterEmail: {
    display: "block",
    color: "#64748b",
    fontSize: "0.75rem",
    textDecoration: "none",
  },
  vehicleType: { color: "#0f172a", fontWeight: 600, fontSize: "0.875rem" },
  vehicleSeat: { color: "#94a3b8", fontSize: "0.75rem", marginTop: 2 },
  district: {
    display: "inline-block",
    padding: "3px 10px",
    background: "#f1f5f9",
    borderRadius: 6,
    color: "#374151",
    fontSize: "0.82rem",
    fontWeight: 500,
  },
  dateMain: { fontWeight: 600, color: "#0f172a", fontSize: "0.85rem" },
  dateSub: { color: "#64748b", fontSize: "0.78rem", marginTop: 2 },
  dateDays: { fontSize: "0.75rem", marginTop: 2, fontWeight: 500 },
  driverYes: {
    display: "inline-block",
    padding: "3px 10px",
    background: "#d1fae5",
    color: "#065f46",
    borderRadius: 6,
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  driverNo: {
    display: "inline-block",
    padding: "3px 10px",
    background: "#f1f5f9",
    color: "#64748b",
    borderRadius: 6,
    fontSize: "0.78rem",
    fontWeight: 500,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: "0.78rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  statusDot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  timeAgo: { color: "#374151", fontWeight: 600, fontSize: "0.82rem" },
  dateSmall: { color: "#94a3b8", fontSize: "0.75rem", marginTop: 2 },
  actions: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
  viewBtn: {
    padding: "5px 12px",
    borderRadius: 7,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  actionBtn: {
    padding: "5px 12px",
    borderRadius: 7,
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    transition: "opacity 0.15s",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    flexWrap: "wrap",
  },
  pageBtn: {
    padding: "7px 16px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  pageNumbers: { display: "flex", gap: 4 },
  pageNum: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  pageNumActive: {
    background: "#ef4444",
    borderColor: "#ef4444",
    color: "#fff",
  },
  pageMeta: { color: "#94a3b8", fontSize: "0.82rem", marginLeft: 8 },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: "#fff",
    borderRadius: 18,
    width: "100%",
    maxWidth: 580,
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.28)",
    animation: "slideIn 0.25s ease",
  },
  modalHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
  },
  modalTitle: {
    fontFamily: "var(--font-display, serif)",
    fontSize: "1.2rem",
    color: "#0f172a",
    margin: 0,
  },
  modalSub: { color: "#94a3b8", fontSize: "0.78rem", marginTop: 4 },
  modalHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  modalBody: { padding: "20px 24px" },
  modalSection: { marginBottom: 24 },
  modalSectionTitle: {
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: 12,
    margin: "0 0 12px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    padding: "8px 0",
    borderBottom: "1px solid #f8fafc",
  },
  detailLabel: { color: "#94a3b8", fontSize: "0.83rem", flexShrink: 0 },
  detailValue: {
    color: "#0f172a",
    fontSize: "0.875rem",
    fontWeight: 500,
    textAlign: "right",
  },
  notesBox: {
    background: "#f8fafc",
    padding: "12px 16px",
    borderRadius: 10,
    color: "#374151",
    fontSize: "0.875rem",
    lineHeight: 1.6,
    border: "1px solid #f1f5f9",
    margin: 0,
  },
  adminTextarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "0.875rem",
    resize: "vertical",
    minHeight: 90,
    outline: "none",
    boxSizing: "border-box",
    color: "#0f172a",
    fontFamily: "inherit",
  },
  saveBtn: {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  statusActionBtn: {
    padding: "9px 20px",
    borderRadius: 9,
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    transition: "opacity 0.15s",
  },
};
