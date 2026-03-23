'use client'

import Link from 'next/link'
import { useState } from 'react'
import { settingsData } from '@/settings'
import SearchModal from './SearchModal'

export default function Header() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <>
      <header className="nav">
        <div className="container nav-inner">

          {/* Brand */}
          <Link href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
            {settingsData.LogoTextFirstPart}
            <span>{settingsData.LogoTextLastPart}</span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>

            {/* Search button */}
            <button
              onClick={() => setShowSearch(true)}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              🔍 Search
            </button>

            <Link href="/get-started" className="btn btn-primary btn-sm">
              Post Free
            </Link>

          </nav>
        </div>
      </header>

      {/* Search Modal */}
      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} />
      )}
    </>
  )
}