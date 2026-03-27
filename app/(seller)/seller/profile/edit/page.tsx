'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { settingsData } from '@/settings'
import { sanitizeText } from '@/utils/sanitize'

export default function EditProfilePage() {
  const router = useRouter()
  const [user,    setUser]    = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [form,    setForm]    = useState({ full_name: '', phone: '', bio: '' })
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
      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({
          full_name: data.full_name || '',
          phone:     data.phone     || '',
          bio:       data.bio       || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSaved(false)

    const { error } = await supabase.from('profiles').upsert({
      id:         user.id,
      full_name:  sanitizeText(form.full_name),
      phone:      form.phone,
      bio:        sanitizeText(form.bio),
      updated_at: new Date().toISOString(),
    })

    setSaving(false)
    if (error) { alert(error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

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

  const isVerified    = profile?.is_verified
  const avatarLetter  = form.full_name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-16)' }}>

      {/* ─── NAV ─── */}
      <header className="nav">
        <div className="container nav-inner">
          <span className="nav-brand">
            {settingsData.LogoTextFirstPart}
            <span>{settingsData.LogoTextLastPart}</span>
          </span>
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
            {'←'} Back
          </button>
        </div>
      </header>

      <div className="container-sm" style={{ paddingTop: 'var(--space-6)' }}>

        {/* ─── Title ─── */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Account</p>
          <h1>Edit Profile</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {user?.email}
          </p>
        </div>

        {/* ─── Avatar Card ─── */}
        <div className="card card-p" style={{
          display: 'flex', alignItems: 'center',
          gap: 'var(--space-4)', marginBottom: 'var(--space-5)',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--neutral-950)', color: 'var(--neutral-0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 800,
            fontFamily: 'var(--font-display)', flexShrink: 0,
          }}>
            {avatarLetter}
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1rem', color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {form.full_name || 'Your Name'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {user?.email}
            </p>
            {isVerified && (
              <span className="badge badge-green" style={{ marginTop: 'var(--space-1)' }}>
                ✅ Verified Seller
              </span>
            )}
          </div>
        </div>

        {/* ─── Success toast ─── */}
        {saved && (
          <div className="alert alert-success animate-fade-in" style={{ marginBottom: 'var(--space-4)' }}>
            ✅ Profile saved successfully!
          </div>
        )}

        {/* ─── Form ─── */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="e.g. Bathila Perera"
                className="input"
              />
            </div>

            {/* Phone — read only if verified */}
            <div className="form-group">
              <label className="form-label">
                Phone Number
                {profile?.phone_verified && (
                  <span className="badge badge-green" style={{ marginLeft: 'var(--space-2)' }}>
                    ✅ Verified
                  </span>
                )}
              </label>
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
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  🇱🇰 +94
                </span>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="77 123 4567"
                  type="tel"
                  disabled={profile?.phone_verified}
                  className="input"
                  style={{ borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}
                />
              </div>
              {profile?.phone_verified && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  📌 Phone number cannot be changed after verification
                </p>
              )}
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
            <div className="form-group" style={{
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--border-default)',
            }}>
              <label className="form-label">Email</label>
              <input value={user?.email} disabled className="input" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Email address cannot be changed here
              </p>
            </div>
          </div>

          {/* Submit */}
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