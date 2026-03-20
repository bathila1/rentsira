'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export default function EditProfilePage() {
  const router = useRouter()
  const [user,    setUser]    = useState<any>(null)
  const [form,    setForm]    = useState({ full_name: '', phone: '', bio: '' })
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const set = (f: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [f]: v }))

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '', bio: data.bio || '' })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone) return alert('Phone number is required to get verified.')
    setSaving(true)
    setSaved(false)
    const { error } = await supabase.from('profiles').upsert({
      id:         user.id,
      full_name:  form.full_name,
      phone:      form.phone,
      bio:        form.bio,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { alert(error.message); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // ─── Loading ───
  if (loading) return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid var(--red-100)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto var(--space-4)',
        }} />
        <p className="label">Loading profile...</p>
      </div>
    </div>
  )

  const isVerified   = profile?.is_verified
  const hasPhone     = !!profile?.phone
  const avatarLetter = form.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="page" style={{ minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>

      {/* ─── NAV ─── */}
      <header className="nav">
        <div className="container nav-inner">
          <span className="nav-brand">SI<span>RA</span></span>
          <button
            onClick={() => router.push('/seller/dashboard')}
            className="btn btn-ghost btn-sm"
          >
            {'←'} Dashboard
          </button>
        </div>
      </header>

      <div className="container-sm" style={{ paddingTop: 'var(--space-10)' }}>

        {/* ─── PAGE TITLE ─── */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Account</p>
          <h1>Edit Profile</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {user?.email}
          </p>
        </div>

        {/* ─── VERIFICATION STATUS ─── */}
        <div className={`verify-card ${isVerified ? 'verified' : 'unverified'}`}
          style={{ marginBottom: 'var(--space-5)' }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
            {isVerified ? '✅' : '⚠️'}
          </span>
          <div style={{ flex: 1 }}>
            <p style={{
              fontWeight: 700, fontSize: '0.9rem',
              color: isVerified ? 'var(--color-success)' : 'var(--color-warning)',
            }}>
              {isVerified ? 'Verified Seller' : 'Account Not Verified'}
            </p>
            <p style={{
              fontSize: '0.78rem', marginTop: '3px',
              color: isVerified ? 'var(--color-success)' : 'var(--color-warning)',
              opacity: 0.85,
            }}>
              {isVerified
                ? `Phone verified on ${new Date(profile.phone_verified_at).toLocaleDateString('en-LK')}`
                : 'Add your phone number to get verified and unlock vehicle uploads'}
            </p>

            {/* Steps — only when not verified */}
            {!isVerified && (
              <div style={{
                marginTop: 'var(--space-3)',
                display: 'flex', flexDirection: 'column',
                gap: 'var(--space-1)',
              }}>
                {[
                  { done: !!form.full_name, label: 'Add your full name' },
                  { done: hasPhone,         label: 'Add phone number' },
                  { done: isVerified,       label: 'Account verified — upload vehicles!' },
                ].map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    gap: 'var(--space-2)', fontSize: '0.78rem',
                    color: step.done ? 'var(--color-success)' : 'var(--color-warning)',
                  }}>
                    <span>{step.done ? '✅' : '○'}</span>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── AVATAR CARD ─── */}
        <div className="card card-p" style={{
          display: 'flex', alignItems: 'center',
          gap: 'var(--space-4)', marginBottom: 'var(--space-5)',
        }}>
          {/* Avatar circle */}
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--neutral-950)',
            color: 'var(--neutral-0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 800,
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
          }}>
            {avatarLetter}
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '1rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {form.full_name || 'Your Name'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {user?.email}
            </p>
            {isVerified && (
              <div style={{ marginTop: 'var(--space-1)' }}>
                <span className="badge badge-green">✅ Verified Seller</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── SUCCESS TOAST ─── */}
        {saved && (
          <div className="alert alert-success animate-fade-in" style={{ marginBottom: 'var(--space-4)' }}>
            ✅ Profile saved!{!isVerified && hasPhone ? ' Your account is now verified 🎉' : ''}
          </div>
        )}

        {/* ─── FORM ─── */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                Full Name
              </label>
              <input
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="e.g. Bathila Perera"
                className="input"
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                Phone Number <span className="required">*</span>
                {profile?.phone_verified && (
                  <span className="badge badge-green" style={{ marginLeft: 'var(--space-2)' }}>
                    ✅ Verified
                  </span>
                )}
                {profile?.phone && !profile?.phone_verified && (
                  <span className="badge badge-warning" style={{ marginLeft: 'var(--space-2)' }}>
                    ⏳ Pending
                  </span>
                )}
              </label>

              {/* Phone input with flag prefix */}
              <div style={{ display: 'flex' }}>
                <span style={{
                  display: 'flex', alignItems: 'center',
                  background: 'var(--bg-subtle)',
                  border: '1.5px solid var(--border-default)',
                  borderRight: 'none',
                  borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)',
                  padding: '0 var(--space-3)',
                  fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  🇱🇰 +94
                </span>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="77 123 4567"
                  type="tel"
                  className="input"
                  style={{
                    borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
                    borderLeft: 'none',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                📌 Saving a phone number auto-verifies your account (OTP coming soon)
              </p>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label">
                Bio <span className="optional">(optional)</span>
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="e.g. Reliable vehicle owner based in Kurunegala..."
                rows={3}
                className="input textarea"
              />
            </div>

            {/* Email — disabled */}
            <div className="form-group" style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-default)' }}>
              <label className="form-label">Email</label>
              <input
                value={user?.email}
                disabled
                className="input"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Email address cannot be changed here
              </p>
            </div>

          </div>

          {/* ─── SUBMIT ─── */}
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg btn-full"
          >
            {saving ? '⏳ Saving...' : '💾 Save Profile'}
          </button>

        </form>
      </div>
    </div>
  )
}