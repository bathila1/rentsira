'use client'

import { useState } from 'react'

const TOPICS = [
  'General Inquiry',
  'Listing a Vehicle',
  'Renting a Vehicle',
  'Account Issues',
  'Payment & Billing',
  'Report a Problem',
  'Partnership',
  'Other',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', topic: '', message: '',
  })
  const [status, setStatus] = useState<Status>('idle')

  const set = (f: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [f]: v }))

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (form.message.length > 500) return
  setStatus('loading')

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1️⃣ Save to DB
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert([{
        name:    form.name,
        email:   form.email,
        phone:   form.phone || null,
        topic:   form.topic,
        message: form.message,
      }])

    if (dbError) throw new Error(dbError.message)

    // 2️⃣ Send email notification
    const { error: fnError } = await supabase.functions.invoke(
      'send-contact-email',
      { body: form }
    )

    if (fnError) throw new Error(fnError.message)

    setStatus('success')

  } catch (err: any) {
    console.error('Contact form error:', err)
    setStatus('error')
  }
}

  if (status === 'success') return (
    <div className="card card-p animate-fade-in-scale" style={{
      textAlign: 'center',
      padding: 'var(--space-12) var(--space-8)',
    }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'var(--color-success-light)',
        border: '2px solid var(--color-success-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', margin: '0 auto var(--space-5)',
      }}>
        ✅
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-2)' }}>
        Message Sent!
      </h3>
      <p style={{
        fontSize: '0.875rem', color: 'var(--text-tertiary)',
        maxWidth: '300px', margin: '0 auto var(--space-6)', lineHeight: 1.7,
      }}>
        Thanks for reaching out, <strong>{form.name}</strong>.
        We'll get back to you at <strong>{form.email}</strong> within 24 hours.
      </p>
      <button
        onClick={() => {
          setForm({ name: '', email: '', phone: '', topic: '', message: '' })
          setStatus('idle')
        }}
        className="btn btn-secondary"
      >
        Send Another Message
      </button>
    </div>
  )

  return (
    <div className="card card-p">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >

        {/* Name + Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text" value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Name?"
              required className="input"
            />
          </div>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email" value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              required className="input"
            />
          </div>
        </div>

        {/* Phone + Topic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label className="form-label">
              Phone <span className="optional">(optional)</span>
            </label>
            <input
              type="tel" value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+94 77 000 0000"
              className="input"
            />
          </div>
          <div className="form-group" style={{ minWidth: 0 }}>
            <label className="form-label">
              Topic <span className="required">*</span>
            </label>
            <select
              value={form.topic}
              onChange={(e) => set('topic', e.target.value)}
              required className="input select"
            >
              <option value="">Select a topic</option>
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="form-group">
          <label className="form-label">
            Message <span className="required">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="Tell us how we can help you..."
            required
            rows={5}
            className="input textarea"
            style={{ resize: 'vertical', minHeight: '120px' }}
          />
          <p style={{
            fontSize: '0.73rem', color: 'var(--text-tertiary)',
            textAlign: 'right', marginTop: '4px',
          }}>
            {form.message.length} / 500
          </p>
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="alert alert-error">
            ❌ Something went wrong. Please try again.
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            🔒 Your info is safe with us
          </p>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '160px' }}
          >
            {status === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgb(255 255 255 / 0.3)',
                  borderTopColor: 'white',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Sending...
              </span>
            ) : '📩 Send Message'}
          </button>
        </div>

      </form>
    </div>
  )
}