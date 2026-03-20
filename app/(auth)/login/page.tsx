'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { settingsData } from '@/settings'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/seller/dashboard')
    }
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
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
            Sign in to manage your listings
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 'var(--space-2)' }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div className="divider-text" style={{ margin: 'var(--space-6) 0' }}>
          or
        </div>

        {/* Register link */}
        <Link href="/register" className="btn btn-secondary btn-full">
          Create a New Account
        </Link>

        {/* Back home */}
        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-5)',
          fontSize: '0.8rem',
          color: 'var(--text-tertiary)',
        }}>
          <Link href="/" style={{ color: 'var(--text-tertiary)' }}>
            {'←'} Back to Home
          </Link>
        </p>

      </div>
    </div>
  )
}