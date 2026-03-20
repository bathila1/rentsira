'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

const VEHICLE_TYPES = ['Car', 'Van', 'SUV', 'Bus', 'Truck', 'Motorbike', 'Three-wheeler']
const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Batticaloa','Ampara','Trincomalee','Kurunegala',
  'Puttalam','Anuradhapura','Polonnaruwa','Badulla','Monaragala',
  'Ratnapura','Kegalle',
]

const DRIVER_LABELS: Record<string, string> = {
  true:  '👨‍✈️ With Driver',
  false: '🔑 Self Drive',
}

export default function FilterBar() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [gpsLoading, setGpsLoading] = useState(false)

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    value ? p.set(key, value) : p.delete(key)
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  const removeFilter = (key: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.delete(key)
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.')
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = new URLSearchParams(searchParams.toString())
        p.set('lat', pos.coords.latitude.toFixed(6))
        p.set('lng', pos.coords.longitude.toFixed(6))
        p.delete('page')
        router.push(`${pathname}?${p.toString()}`)
        setGpsLoading(false)
      },
      () => { alert('Could not get location.'); setGpsLoading(false) }
    )
  }

  const clearGPS = () => {
    const p = new URLSearchParams(searchParams.toString())
    p.delete('lat'); p.delete('lng'); p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  const clearAll   = () => router.push(pathname)
  const hasGPS     = searchParams.has('lat')
  const activeType       = searchParams.get('type')       || ''
  const activeDistrict   = searchParams.get('district')   || ''
  const activeWithDriver = searchParams.get('with_driver') || ''
  const hasFilters = !!(activeType || activeDistrict || activeWithDriver || hasGPS)

  // ── Build active chip list ──
  const activeChips = [
    activeType       && { key: 'type',        label: `🚗 ${activeType}` },
    activeDistrict   && { key: 'district',     label: `📍 ${activeDistrict}` },
    activeWithDriver && { key: 'with_driver',  label: DRIVER_LABELS[activeWithDriver] || activeWithDriver },
    hasGPS           && { key: 'gps',          label: '📍 Near Me' },
  ].filter(Boolean) as { key: string; label: string }[]

  const selectStyle = {
    background: 'var(--bg-subtle)',
    border: '1.5px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.55rem 2rem 0.55rem 0.85rem',
    fontSize: '0.83rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1rem',
    transition: 'var(--transition-fast)',
  }

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>

      {/* ─── FILTER BAR ─── */}
      <div className="filter-bar">

        {/* Vehicle Type */}
        <select
          value={activeType}
          onChange={(e) => updateFilter('type', e.target.value)}
          style={{
            ...selectStyle,
            borderColor: activeType ? 'var(--color-primary)' : 'var(--border-default)',
            background:  activeType ? 'var(--color-primary-light)' : 'var(--bg-subtle)',
            color:       activeType ? 'var(--color-primary)' : 'var(--text-primary)',
          }}
        >
          <option value="">🚗 All Types</option>
          {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* District */}
        <select
          value={activeDistrict}
          onChange={(e) => updateFilter('district', e.target.value)}
          style={{
            ...selectStyle,
            borderColor: activeDistrict ? 'var(--color-primary)' : 'var(--border-default)',
            background:  activeDistrict ? 'var(--color-primary-light)' : 'var(--bg-subtle)',
            color:       activeDistrict ? 'var(--color-primary)' : 'var(--text-primary)',
          }}
        >
          <option value="">📍 All Districts</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Driver */}
        <select
          value={activeWithDriver}
          onChange={(e) => updateFilter('with_driver', e.target.value)}
          style={{
            ...selectStyle,
            borderColor: activeWithDriver ? 'var(--color-primary)' : 'var(--border-default)',
            background:  activeWithDriver ? 'var(--color-primary-light)' : 'var(--bg-subtle)',
            color:       activeWithDriver ? 'var(--color-primary)' : 'var(--text-primary)',
          }}
        >
          <option value="">👤 Driver: Any</option>
          <option value="true">👨‍✈️ With Driver</option>
          <option value="false">🔑 Self Drive</option>
        </select>

        {/* Near Me */}
        {hasGPS ? (
          <button
            onClick={clearGPS}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--color-primary-light)',
              border: '1.5px solid var(--color-primary-border)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.55rem 0.85rem',
              fontSize: '0.83rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'var(--transition-fast)',
            }}
          >
            📍 Near Me
            <span style={{
              background: 'var(--color-primary)',
              color: 'white', borderRadius: '50%',
              width: '16px', height: '16px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.65rem',
              fontWeight: 800,
            }}>✕</span>
          </button>
        ) : (
          <button
            onClick={handleNearMe}
            disabled={gpsLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--bg-subtle)',
              border: '1.5px solid var(--border-default)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.55rem 0.85rem',
              fontSize: '0.83rem', fontWeight: 600,
              cursor: gpsLoading ? 'not-allowed' : 'pointer',
              opacity: gpsLoading ? 0.5 : 1,
              fontFamily: 'var(--font-body)',
              transition: 'var(--transition-fast)',
            }}
          >
            {gpsLoading ? '⏳ Locating...' : '📍 Near Me'}
          </button>
        )}

        {/* Clear All — only in filter bar on desktop */}
        {hasFilters && (
          <button
            onClick={clearAll}
            style={{
              marginLeft: 'auto',
              background: 'none', border: 'none',
              fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--color-primary)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              textDecoration: 'underline',
              transition: 'var(--transition-fast)',
            }}
          >
            ✕ Clear All
          </button>
        )}
      </div>

      {/* ─── ACTIVE FILTER CHIPS ─── */}
      {activeChips.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-3)',
          animation: 'fade-in 0.2s ease',
        }}>

          {/* Label */}
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginRight: 'var(--space-1)',
          }}>
            Active:
          </span>

          {/* Chips */}
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => chip.key === 'gps' ? clearGPS() : removeFilter(chip.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--neutral-950)',
                color: 'var(--neutral-0)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px 4px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'var(--transition-fast)',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--neutral-950)'
              }}
            >
              {chip.label}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '14px', height: '14px',
                background: 'rgb(255 255 255 / 0.2)',
                borderRadius: '50%',
                fontSize: '0.6rem',
                fontWeight: 800,
                lineHeight: 1,
              }}>
                ✕
              </span>
            </button>
          ))}

          {/* Clear all chips */}
          {activeChips.length > 1 && (
            <button
              onClick={clearAll}
              style={{
                background: 'none', border: 'none',
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                textDecoration: 'underline',
                padding: '4px',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}