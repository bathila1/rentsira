'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { settingsData } from '@/settings'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const set = (f: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic password length check
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone }
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/seller/dashboard'), 1500)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-scale">

        {/* Logo */}
        <div className="auth-logo">
          {settingsData.LogoTextFirstPart}<span>{settingsData.LogoTextLastPart}</span>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: 'var(--space-1)' }}>
            Create an Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
            Start listing your vehicles today
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            ❌ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-5)' }}>
            ✅ Account created! Redirecting to dashboard...
          </div>
        )}

        {/* Form */}
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
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Bathila Perera"
              required
              className="input"
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
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="77 123 4567"
                required
                className="input"
                style={{ borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="divider" style={{ margin: 0 }} />

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="input"
            />
            {/* Strength hint */}
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

          {/* Terms note */}
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            lineHeight: 1.6,
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

        {/* Divider */}
        <div className="divider-text" style={{ margin: 'var(--space-6) 0' }}>
          already have an account?
        </div>

        {/* Login link */}
        <Link href="/login" className="btn btn-secondary btn-full">
          Sign In Instead
        </Link>

        {/* Back home */}
        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-5)',
          fontSize: '0.8rem',
        }}>
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>
            {'←'} Back to Home
          </Link>
        </p>

      </div>
    </div>
  )
}