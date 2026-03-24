'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

const BUMP_OPTIONS = [
  { label: '6 Hours', hours: 6,   tag: '',        desc: 'Quick visibility boost' },
  { label: '1 Day',   hours: 24,  tag: 'Free',    desc: 'Most popular choice' },
  { label: '2 Days',  hours: 48,  tag: '',        desc: 'Extended reach' },
  { label: '3 Days',  hours: 72,  tag: 'Popular', desc: 'Best value' },
  { label: '5 Days',  hours: 120, tag: '',        desc: 'Maximum exposure' },
  { label: '1 Week',  hours: 168, tag: 'Max',     desc: 'Ultimate boost — 7 days' },
]

type BumpStatus = 'idle' | 'loading' | 'cooldown' | 'success' | 'error'

export default function BumpModal({ vehicle, onClose, onSuccess }: {
  vehicle: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [selected,    setSelected]    = useState(24)
  const [status,      setStatus]      = useState<BumpStatus>('idle')
  const [errorMsg,    setErrorMsg]    = useState('')
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null)
  const [timeLeft,    setTimeLeft]    = useState('')
  const [bumpHistory, setBumpHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const isCurrentlyBumped = vehicle.bumped_until && new Date(vehicle.bumped_until) > new Date()

  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase
        .from('bump_history')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('bumped_at', { ascending: false })
        .limit(5)
      setBumpHistory(data || [])
      if (data && data.length > 0) {
        const lastBump     = new Date(data[0].bumped_at)
        const cooldownExpiry = new Date(lastBump.getTime() + 6 * 3600000)
        if (cooldownExpiry > new Date()) {
          setCooldownEnd(cooldownExpiry)
          setStatus('cooldown')
        }
      }
    }
    loadHistory()
  }, [vehicle.id])

  useEffect(() => {
    if (!cooldownEnd) return
    const interval = setInterval(() => {
      const diff = cooldownEnd.getTime() - Date.now()
      if (diff <= 0) {
        setStatus('idle'); setCooldownEnd(null); setTimeLeft('')
        clearInterval(interval); return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldownEnd])

  const handleBump = async () => {
    setStatus('loading'); setErrorMsg('')
    const { data, error } = await supabase.rpc('perform_bump', {
      p_vehicle_id:     vehicle.id,
      p_duration_hours: selected,
    })
    if (error || !data?.success) {
      const msg = data?.error || error?.message || 'Unknown error'
      if (msg === 'cooldown') { setStatus('cooldown'); setErrorMsg('You must wait 6 hours between bumps.') }
      else { setStatus('error'); setErrorMsg(msg) }
      return
    }
    setStatus('success')
    setTimeout(() => onSuccess(), 2000)
  }

  const previewExpiry = () => {
    const base = isCurrentlyBumped ? new Date(vehicle.bumped_until) : new Date()
    base.setHours(base.getHours() + selected)
    return base.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className="modal-overlay">
      <div className="modal animate-fade-in-scale">

        {/* ─── Header ─── */}
        <div className="modal-header">
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '1.05rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              🔥 Bump Up Ad
            </h3>
            <p style={{
              fontSize: '0.78rem', color: 'var(--text-tertiary)',
              marginTop: '2px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {vehicle.make} {vehicle.model} ({vehicle.year}) • 📍 {vehicle.district}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
              transition: 'var(--transition-fast)',
            }}
          >
            ✕
          </button>
        </div>

        {/* ─── Body ─── */}
        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* SUCCESS */}
          {status === 'success' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }} className="animate-fade-in">
              <p style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🎉</p>
              <p style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.1rem', color: 'var(--color-success)',
              }}>
                Bumped Successfully!
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                Your ad is now at the top of search results
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Active until: {previewExpiry()}
              </p>
            </div>
          )}

          {/* COOLDOWN */}
          {status === 'cooldown' && (
            <div style={{
              background: 'var(--color-warning-light)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-5)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>⏳</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-warning)' }}>
                Bump Cooldown Active
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-warning)', marginTop: 'var(--space-2)' }}>
                You can bump again in:
              </p>
              <p style={{
                fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-warning)',
                fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
                marginTop: 'var(--space-3)',
              }}>
                {timeLeft}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)' }}>
                Cooldown ensures fair visibility for all Renters.
              </p>
            </div>
          )}

          {/* IDLE / LOADING / ERROR */}
          {(status === 'idle' || status === 'loading' || status === 'error') && (
            <>
              {/* Error */}
              {status === 'error' && (
                <div className="alert alert-error">❌ {errorMsg}</div>
              )}

              {/* Currently bumped notice */}
              {isCurrentlyBumped && (
                <div style={{
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-3)',
                }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    🔥 Currently Bumped
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Expires: {new Date(vehicle.bumped_until).toLocaleString('en-LK', {
                      dateStyle: 'medium', timeStyle: 'short'
                    })}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    New duration will <strong>extend</strong> from current expiry
                  </p>
                </div>
              )}

              {/* Free promo banner */}
              <div style={{
                background: 'var(--color-success-light)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎁</span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success)' }}>
                    Bumping is FREE right now!
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', opacity: 0.8 }}>
                    Premium bump packages coming soon
                  </p>
                </div>
              </div>

              {/* Duration picker */}
              <div>
                <p className="label" style={{ marginBottom: 'var(--space-2)' }}>Select Duration</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-2)',
                }}>
                  {BUMP_OPTIONS.map((opt) => (
                    <button
                      key={opt.hours}
                      onClick={() => setSelected(opt.hours)}
                      style={{
                        position: 'relative',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        border: selected === opt.hours
                          ? '2px solid var(--color-primary)'
                          : '2px solid var(--border-default)',
                        background: selected === opt.hours
                          ? 'var(--color-primary-light)'
                          : 'var(--bg-card)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      {/* Tag */}
                      {opt.tag && (
                        <span className={`badge ${
                          opt.tag === 'Max'     ? 'badge-red' :
                          opt.tag === 'Popular' ? 'badge-dark' :
                          opt.tag === 'Free'    ? 'badge-green' : 'badge-gray'
                        }`} style={{ position: 'absolute', top: '8px', right: '8px' }}>
                          {opt.tag}
                        </span>
                      )}

                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700, fontSize: '0.9rem',
                        color: selected === opt.hours
                          ? 'var(--color-primary)'
                          : 'var(--text-primary)',
                      }}>
                        {opt.label}
                      </span>
                      <span style={{
                        fontSize: '0.73rem',
                        color: 'var(--text-tertiary)',
                        marginTop: '3px',
                      }}>
                        {opt.desc}
                      </span>

                      {/* Check mark */}
                      {selected === opt.hours && (
                        <span style={{
                          position: 'absolute', bottom: '8px', right: '10px',
                          color: 'var(--color-primary)',
                          fontSize: '0.75rem', fontWeight: 800,
                        }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry preview */}
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {isCurrentlyBumped ? '⏱️ Will extend to' : '📅 Will be active until'}
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: '0.9rem',
                  color: 'var(--text-primary)', marginTop: '4px',
                }}>
                  {previewExpiry()}
                </p>
              </div>

              {/* What bump does */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
                {[
                  { icon: '🔝', label: 'Top of search' },
                  { icon: '🔥', label: 'Bumped badge' },
                  { icon: '👀', label: 'More views' },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-3)',
                    textAlign: 'center',
                    border: '1px solid var(--border-default)',
                  }}>
                    <p style={{ fontSize: '1.3rem' }}>{item.icon}</p>
                    <p style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--text-secondary)', marginTop: '4px',
                    }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── Bump History ─── */}
          {bumpHistory.length > 0 && status !== 'success' && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: 'none', border: 'none',
                  fontSize: '0.78rem', color: 'var(--text-tertiary)',
                  cursor: 'pointer', textDecoration: 'underline',
                  width: '100%', textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {showHistory ? '▲ Hide' : '▼ Show'} bump history ({bumpHistory.length})
              </button>

              {showHistory && (
                <div style={{
                  marginTop: 'var(--space-2)',
                  display: 'flex', flexDirection: 'column',
                  gap: 'var(--space-1)',
                }}>
                  {bumpHistory.map((b) => (
                    <div key={b.id} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-2) var(--space-3)',
                    }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {new Date(b.bumped_at).toLocaleDateString('en-LK')} — {b.duration_hours}h
                      </span>
                      <span className={`badge ${b.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        {status !== 'success' && status !== 'cooldown' && (
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={handleBump}
              disabled={status === 'loading'}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {status === 'loading' ? '⏳ Processing...' : '🔥 Bump Now — FREE'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}