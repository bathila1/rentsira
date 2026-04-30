'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { sanitizeText } from '@/utils/sanitize';
import { SriLankanDistricts, dynamicData } from '@/settings';

type FormState = {
  renter_name: string;
  renter_phone: string;
  vehicle_type: string;
  pickup_district: string;
  pickup_date: string;
  return_date: string;
  with_driver: boolean;
  seat_count: string;
  notes: string;
};

const INITIAL_FORM: FormState = {
  renter_name: '',
  renter_phone: '',
  vehicle_type: '',
  pickup_district: '',
  pickup_date: '',
  return_date: '',
  with_driver: false,
  seat_count: '',
  notes: '',
};

export default function BookingRequestPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.renter_name || !form.renter_phone || !form.vehicle_type || !form.pickup_district || !form.pickup_date || !form.return_date) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.return_date < form.pickup_date) {
      setError('Return date must be after pickup date.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from('booking_requests').insert({
        renter_name: sanitizeText(form.renter_name),
        renter_phone: sanitizeText(form.renter_phone),
        vehicle_type: sanitizeText(form.vehicle_type),
        pickup_district: sanitizeText(form.pickup_district),
        pickup_date: form.pickup_date,
        return_date: form.return_date,
        with_driver: form.with_driver,
        seat_count: form.seat_count ? parseInt(form.seat_count) : null,
        notes: form.notes ? sanitizeText(form.notes) : null,
        status: 'pending',
        user_id: user?.id ?? null,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--neutral-950)', marginBottom: 'var(--space-3)' }}>
            Request Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
            We've received your vehicle request. Our team will review it and get back to you as soon as possible via phone.
          </p>
          <button className="btn btn-primary" onClick={() => setSuccess(false)}>
            Submit Another Request
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      {/* Hero */}
      <div style={{
        background: 'var(--neutral-950)',
        padding: 'var(--space-16) var(--space-6) var(--space-12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'var(--color-primary)',
        }} />
        <div style={{
          position: 'absolute',
          right: -80,
          top: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '60px solid rgba(248,50,50,0.07)',
          pointerEvents: 'none',
        }} />

        <div className="container-sm">
          <span style={{
            display: 'inline-block',
            background: 'rgba(248,50,50,0.15)',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-4)',
          }}>
            Find a Vehicle
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 'var(--space-3)',
          }}>
            Tell us what you need.<br />
            <span style={{ color: 'var(--color-primary)' }}>We'll find for u.</span>
          </h1>
          <p style={{ color: 'var(--neutral-400)', maxWidth: 480, lineHeight: 1.6 }}>
            Submit your requirements and our team will source the perfect vehicle for your trip — no hassle, no searching.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container-sm" style={{ padding: 'var(--space-10) var(--space-6)', maxWidth: 660 }}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── Contact Details ── */}
          <div className="section-card" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="section-card-title">Your Details</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="renter_name">
                Full Name <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <input
                id="renter_name"
                name="renter_name"
                className="input"
                type="text"
                placeholder="e.g. Kamal Perera"
                value={form.renter_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="renter_phone">
                Phone Number <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <input
                id="renter_phone"
                name="renter_phone"
                className="input"
                type="tel"
                placeholder="e.g. 077 123 4567"
                value={form.renter_phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ── Vehicle Requirements ── */}
          <div className="section-card" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="section-card-title">Vehicle Requirements</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="vehicle_type">
                Vehicle Type <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <select
                id="vehicle_type"
                name="vehicle_type"
                className="input"
                value={form.vehicle_type}
                onChange={handleChange}
                required
              >
                <option value="">Select a type…</option>
                {(dynamicData?.vehicle_types ?? []).map((t: string) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="seat_count">Seats Needed</label>
                <input
                  id="seat_count"
                  name="seat_count"
                  className="input"
                  type="number"
                  min={1}
                  max={60}
                  placeholder="e.g. 5"
                  value={form.seat_count}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  cursor: 'pointer',
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1.5px solid var(--neutral-200)',
                  borderRadius: 'var(--radius-lg)',
                  background: form.with_driver ? 'rgba(248,50,50,0.05)' : 'transparent',
                  borderColor: form.with_driver ? 'var(--color-primary)' : 'var(--neutral-200)',
                  transition: 'all 0.15s',
                  marginTop: 'auto',
                }}>
                  <input
                    type="checkbox"
                    name="with_driver"
                    checked={form.with_driver}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--color-primary)', width: 18, height: 18 }}
                  />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--neutral-950)', fontWeight: 500 }}>
                    With Driver
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Trip Details ── */}
          <div className="section-card" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="section-card-title">Trip Details</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="pickup_district">
                Pickup District <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <select
                id="pickup_district"
                name="pickup_district"
                className="input"
                value={form.pickup_district}
                onChange={handleChange}
                required
              >
                <option value="">Select a district…</option>
                {SriLankanDistricts.map((d: string) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{  gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="pickup_date">
                  Pickup Date <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <input
                  id="pickup_date"
                  name="pickup_date"
                  className="input"
                  type="date"
                  min={today}
                  value={form.pickup_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="return_date">
                  Return Date <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <input
                  id="return_date"
                  name="return_date"
                  className="input"
                  type="date"
                  min={form.pickup_date || today}
                  value={form.return_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Special Requirements</label>
              <textarea
                id="notes"
                name="notes"
                className="input"
                rows={4}
                placeholder="Any specific requirements — AC, luggage space, baby seat, specific model, budget range…"
                value={form.notes}
                onChange={handleChange}
                style={{ resize: 'vertical', minHeight: 100 }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Submitting…
              </span>
            ) : 'Submit Booking Request'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            We'll contact you within a few hours to confirm your booking.
          </p>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}