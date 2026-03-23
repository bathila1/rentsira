'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { settingsData } from '@/settings'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const set = (f: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false); return
    }
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, phone: form.phone } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/seller/dashboard'), 1500)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setGLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setGLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-scale">

        {/* ─── Logo ─── */}
        <div className="auth-logo">
          {settingsData.LogoTextFirstPart}
          <span>{settingsData.LogoTextLastPart}</span>
        </div>

        {/* ─── Title ─── */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-1)' }}>
            Create an Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
            Start listing your vehicles today
          </p>
        </div>

        {/* ─── Alerts ─── */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
            ✅ Account created! Redirecting...
          </div>
        )}

        {/* ─── Google Button ─── */}
        <button
          onClick={handleGoogle}
          disabled={gLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            padding: '0.75rem',
            border: '1.5px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            cursor: gLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            transition: 'var(--transition-fast)',
            opacity: gLoading ? 0.6 : 1,
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={(e) => {
            if (!gLoading) e.currentTarget.style.borderColor = 'var(--border-strong)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          {gLoading ? (
            <>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: '2px solid var(--border-default)',
                borderTopColor: 'var(--color-primary)',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0,
              }} />
              Connecting to Google...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {/* ─── Divider ─── */}
        <div className="divider-text" style={{ margin: 'var(--space-5) 0' }}>
          or register with email
        </div>

        {/* ─── Email Form ─── */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >

          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text" value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Bathila Perera"
              required className="input"
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <div style={{ display: 'flex' }}>
              <span style={{
                display: 'flex', alignItems: 'center',
                padding: '0 var(--space-3)',
                background: 'var(--bg-subtle)',
                border: '1.5px solid var(--border-default)',
                borderRight: 'none',
                borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                🇱🇰 +94
              </span>
              <input
                type="tel" value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="77 123 4567"
                required className="input"
                style={{ borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}
              />
            </div>
          </div>

          <div className="divider" style={{ margin: 0 }} />

          {/* Email */}
          <div className="form-group">
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password" value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Min. 6 characters"
              required className="input"
            />
            {/* Strength bar */}
            {form.password.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: '6px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: '3px',
                    borderRadius: 'var(--radius-full)',
                    background: form.password.length >= i * 4
                      ? i === 1 ? 'var(--color-error)'
                        : i === 2 ? 'var(--color-warning)'
                        : 'var(--color-success)'
                      : 'var(--border-default)',
                    transition: 'var(--transition-fast)',
                  }} />
                ))}
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {form.password.length === 0 ? 'Use at least 6 characters'
                : form.password.length < 4  ? 'Weak password'
                : form.password.length < 8  ? 'Moderate password'
                : 'Strong password ✓'}
            </p>
          </div>

          {/* Terms */}
          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            textAlign: 'center', lineHeight: 1.6,
          }}>
            By registering you agree to our{' '}
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Privacy Policy</span>
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
          </button>

        </form>

        {/* ─── Bottom: already have account ─── */}
        <div className="divider-text" style={{ margin: 'var(--space-6) 0' }}>
          already have an account?
        </div>

        <Link href="/login" className="btn btn-secondary btn-full">
          Sign In Instead
        </Link>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: '0.8rem' }}>
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>
            {'←'} Back to Home
          </Link>
        </p>

      </div>
    </div>
  )
}