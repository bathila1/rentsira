'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed';

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

const STATUS_CONFIG: Record<BookingStatus, { label: string; badge: string; next: BookingStatus[] }> = {
  pending:   { label: 'Pending',   badge: 'badge badge-warning', next: ['confirmed', 'rejected'] },
  confirmed: { label: 'Confirmed', badge: 'badge badge-green',   next: ['completed', 'rejected'] },
  rejected:  { label: 'Rejected',  badge: 'badge badge-red',     next: ['pending'] },
  completed: { label: 'Completed', badge: 'badge badge-gray',    next: [] },
};

const PAGE_SIZE = 15;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysBetween(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export default function AdminBookingsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail / edit modal state
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Auth guard ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (user?.email && user.email === adminEmail) {
        setIsAdmin(true);
      }
      setAuthChecked(true);
    });
  }, []);

  // ── Fetch bookings ──
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('booking_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, count, error } = await query;
    if (!error) {
      setBookings((data as BookingRequest[]) ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    if (isAdmin) fetchBookings();
  }, [isAdmin, fetchBookings]);

  // ── Status update ──
  async function updateStatus(id: string, status: BookingStatus) {
    await supabase.from('booking_requests').update({ status }).eq('id', id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  }

  // ── Save admin notes ──
  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase
      .from('booking_requests')
      .update({ admin_notes: adminNotes })
      .eq('id', selected.id);
    setSaving(false);
    if (!error) {
      setSaveMsg('Saved!');
      setBookings((prev) =>
        prev.map((b) => (b.id === selected.id ? { ...b, admin_notes: adminNotes } : b))
      );
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }

  function openDetail(b: BookingRequest) {
    setSelected(b);
    setAdminNotes(b.admin_notes ?? '');
    setSaveMsg('');
  }

  // ── Guards ──
  if (!authChecked) return null;

  if (!isAdmin) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔒</div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neutral-950)', marginBottom: 'var(--space-2)' }}>Access Denied</h1>
          <p style={{ color: 'var(--text-secondary)' }}>This page is restricted to admins only.</p>
        </div>
      </main>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const counts = { all: total } as Record<string, number>;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      {/* Header */}
      <div style={{ background: 'var(--neutral-950)', padding: 'var(--space-8) var(--space-6)', borderBottom: '4px solid var(--color-primary)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <p style={{ color: 'var(--neutral-500)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Admin Panel</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#fff' }}>Booking Requests</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--neutral-400)', fontSize: '0.85rem' }}>{total} total</span>
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--neutral-300)' }} onClick={fetchBookings}>
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {(['all', 'pending', 'confirmed', 'rejected', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid',
                borderColor: statusFilter === s ? 'var(--color-primary)' : 'var(--neutral-200)',
                background: statusFilter === s ? 'var(--color-primary)' : '#fff',
                color: statusFilter === s ? '#fff' : 'var(--neutral-700)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-secondary)' }}>Loading…</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <p>No booking requests found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-xl)', border: '1px solid var(--neutral-200)', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-100)', background: 'var(--neutral-50)' }}>
                  {['Renter', 'Vehicle', 'District', 'Dates', 'Driver', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: 'var(--space-3) var(--space-4)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--neutral-500)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => {
                  const cfg = STATUS_CONFIG[b.status];
                  const nights = daysBetween(b.pickup_date, b.return_date);
                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: i < bookings.length - 1 ? '1px solid var(--neutral-100)' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--neutral-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--neutral-950)', fontSize: '0.9rem' }}>{b.renter_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{b.renter_phone}</div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ color: 'var(--neutral-950)', fontSize: '0.9rem' }}>{b.vehicle_type}</div>
                        {b.seat_count && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{b.seat_count} seats</div>}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--neutral-700)', fontSize: '0.9rem' }}>
                        {b.pickup_district}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--neutral-950)' }}>{formatDate(b.pickup_date)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>→ {formatDate(b.return_date)} ({nights}d)</div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>
                        {b.with_driver ? (
                          <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>Yes</span>
                        ) : (
                          <span style={{ color: 'var(--neutral-400)', fontSize: '0.85rem' }}>No</span>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <span className={cfg.badge}>{cfg.label}</span>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                          <button className="btn btn-sm btn-ghost" onClick={() => openDetail(b)}>View</button>
                          {cfg.next.map((ns) => (
                            <button
                              key={ns}
                              className={`btn btn-sm ${ns === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ textTransform: 'capitalize' }}
                              onClick={() => updateStatus(b.id, ns)}
                            >
                              {STATUS_CONFIG[ns].label}
                            </button>
                          ))}
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
          <div className="pagination" style={{ marginTop: 'var(--space-6)' }}>
            <button className="btn btn-sm btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-sm btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: 560,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          }}>
            {/* Modal header */}
            <div style={{
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: '1px solid var(--neutral-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1,
            }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--neutral-950)' }}>
                  {selected.renter_name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
                  Submitted {formatDate(selected.created_at)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className={STATUS_CONFIG[selected.status].badge}>
                  {STATUS_CONFIG[selected.status].label}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  style={{ border: 'none', background: 'var(--neutral-100)', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: 'var(--space-6)' }}>

              {/* Contact */}
              <section style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neutral-500)', marginBottom: 'var(--space-3)' }}>
                  Contact
                </h3>
                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <DetailRow label="Phone" value={
                    <a href={`tel:${selected.renter_phone}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{selected.renter_phone}</a>
                  } />
                  {selected.renter_email && (
                    <DetailRow label="Email" value={
                      <a href={`mailto:${selected.renter_email}`} style={{ color: 'var(--color-primary)' }}>{selected.renter_email}</a>
                    } />
                  )}
                </div>
              </section>

              {/* Trip */}
              <section style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neutral-500)', marginBottom: 'var(--space-3)' }}>
                  Trip Details
                </h3>
                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <DetailRow label="Vehicle" value={selected.vehicle_type} />
                  <DetailRow label="District" value={selected.pickup_district} />
                  <DetailRow label="Pickup" value={formatDate(selected.pickup_date)} />
                  <DetailRow label="Return" value={`${formatDate(selected.return_date)} (${daysBetween(selected.pickup_date, selected.return_date)} days)`} />
                  <DetailRow label="With Driver" value={selected.with_driver ? 'Yes' : 'No'} />
                  {selected.seat_count && <DetailRow label="Seats" value={`${selected.seat_count}`} />}
                </div>
              </section>

              {/* Notes */}
              {selected.notes && (
                <section style={{ marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neutral-500)', marginBottom: 'var(--space-3)' }}>
                    Customer Notes
                  </h3>
                  <p style={{ background: 'var(--neutral-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', color: 'var(--neutral-800)', fontSize: '0.9rem', lineHeight: 1.6, border: '1px solid var(--neutral-100)' }}>
                    {selected.notes}
                  </p>
                </section>
              )}

              {/* Admin Notes */}
              <section style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neutral-500)', marginBottom: 'var(--space-3)' }}>
                  Admin Notes
                </h3>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Add internal notes, vehicle found, price quoted…"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 90, marginBottom: 'var(--space-3)' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <button className="btn btn-primary btn-sm" onClick={saveNotes} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Notes'}
                  </button>
                  {saveMsg && <span style={{ color: 'green', fontSize: '0.85rem', fontWeight: 500 }}>✓ {saveMsg}</span>}
                </div>
              </section>

              {/* Status actions */}
              {STATUS_CONFIG[selected.status].next.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neutral-500)', marginBottom: 'var(--space-3)' }}>
                    Update Status
                  </h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {STATUS_CONFIG[selected.status].next.map((ns) => (
                      <button
                        key={ns}
                        className={`btn btn-sm ${ns === 'confirmed' || ns === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ textTransform: 'capitalize' }}
                        onClick={() => updateStatus(selected.id, ns)}
                      >
                        Mark as {STATUS_CONFIG[ns].label}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--neutral-100)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--neutral-950)', fontSize: '0.9rem', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}