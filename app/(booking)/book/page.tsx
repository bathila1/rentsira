'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { SriLankanDistricts, dynamicData, settingsData } from '@/settings';
import BackButton from '@/app/(user)/explore/[id]/components/BackBtn';

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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-booking`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, // ← ADD THIS

           },

          body: JSON.stringify({
            renter_name:     form.renter_name,
            renter_phone:    form.renter_phone,
            vehicle_type:    form.vehicle_type,
            pickup_district: form.pickup_district,
            pickup_date:     form.pickup_date,
            return_date:     form.return_date,
            with_driver:     form.with_driver,
            seat_count:      form.seat_count || null,
            notes:           form.notes || null,
            user_id:         user?.id ?? null,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Submission failed.');

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
            background: 'rgb(0, 255, 128)',
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
        <BackButton/>

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

<div style={{ marginTop: 'var(--space-6)' }}>
  <a
    href={`tel:${settingsData.phone2}`}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 24px',
      background: 'rgba(255,255,255,0.06)',
      border: '1.5px solid rgba(255,255,255,0.15)',
      borderRadius: 'var(--radius-full)',
      textDecoration: 'none',
      backdropFilter: 'blur(8px)',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget;
      el.style.background = 'rgba(248,50,50,0.15)';
      el.style.borderColor = 'var(--color-primary)';
      el.style.transform = 'translateY(-1px)';
      el.style.boxShadow = '0 8px 32px rgba(248,50,50,0.2)';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget;
      el.style.background = 'rgba(255,255,255,0.06)';
      el.style.borderColor = 'rgba(255,255,255,0.15)';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
    }}
  >
    {/* Animated ping dot */}
    <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
      <span style={{
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(227, 0, 0, 0.53)',
        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{
        position: 'relative',
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgb(66, 255, 249) 0%,rgba(60, 255, 0, 0.8))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      </span>
    </span>

    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}>
        Prefer to call?
      </span>
      <span style={{
        color: '#fff',
        fontFamily: 'var(--font-display)',
        fontSize: '1.05rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1,
      }}>
        {settingsData.phone1}
      </span>
    </span>

    {/* Arrow */}
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="rgba(255,255,255,0.4)"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginLeft: 4 }}
    >
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </a>
</div>

<style>{`
  @keyframes ping {
    75%, 100% { transform: scale(1.8); opacity: 0; }
  }
`}</style>
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