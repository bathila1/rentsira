'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const VEHICLE_TYPES = ['Car', 'Van', 'SUV', 'Bus', 'Truck', 'Motorbike', 'Three-wheeler']

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala',
  'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala',
  'Ratnapura', 'Kegalle',
]

export default function Search() {
  const router = useRouter()
  const [type,       setType]       = useState('')
  const [district,   setDistrict]   = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (type)     params.set('type', type)
    if (district) params.set('district', district)
    router.push(`/explore?${params.toString()}`)
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams()
        if (type)     params.set('type', type)
        if (district) params.set('district', district)
        params.set('lat', pos.coords.latitude.toFixed(6))
        params.set('lng', pos.coords.longitude.toFixed(6))
        router.push(`/explore?${params.toString()}`)
        setGpsLoading(false)
      },
      () => {
        alert('Could not get location. Please allow location access.')
        setGpsLoading(false)
      }
    )
  }

  return (
    <div style={{
      width: '100%',
      background: 'rgb(255 255 255 / 0.07)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgb(255 255 255 / 0.15)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-3)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-3)',
      boxShadow: '0 8px 32px rgb(0 0 0 / 0.2)',
    }}>

      {/* Vehicle Type */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{
          flex: 1,
          minWidth: '140px',
          background: 'var(--neutral-0)',
          border: '1.5px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.7rem 2.2rem 0.7rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.6rem center',
          backgroundSize: '1rem',
        }}
      >
        <option value="">🚗 Vehicle Type</option>
        {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* District */}
      <select
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        style={{
          flex: 1,
          minWidth: '140px',
          background: 'var(--neutral-0)',
          border: '1.5px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.7rem 2.2rem 0.7rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.6rem center',
          backgroundSize: '1rem',
        }}
      >
        <option value="">📍 Select District</option>
        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Near Me */}
      <button
        onClick={handleNearMe}
        disabled={gpsLoading}
        style={{
          background: 'rgb(255 255 255 / 0.12)',
          border: '1.5px solid rgb(255 255 255 / 0.25)',
          color: 'var(--neutral-0)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.7rem 1.1rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: gpsLoading ? 'not-allowed' : 'pointer',
          opacity: gpsLoading ? 0.5 : 1,
          whiteSpace: 'nowrap',
          transition: 'var(--transition-fast)',
        }}
      >
        {gpsLoading ? '⏳ Locating...' : '📍 Near Me'}
      </button>

      {/* Search */}
      <button
        onClick={handleSearch}
        className="btn btn-primary"
        style={{ whiteSpace: 'nowrap', minWidth: '110px' }}
      >
        🔍 Search
      </button>

    </div>
  )
}