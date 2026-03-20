import Link from 'next/link'

const Header = () => {
  return (
    <header className="nav">
      <div className="container nav-inner">

        {/* Brand */}
        <Link href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          SI<span>RA</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href="/explore" className="btn btn-ghost btn-sm">
            Browse Vehicles
          </Link>
          <Link href="/check" className="btn btn-primary btn-sm">
            List Your Vehicle
          </Link>
        </nav>

      </div>
    </header>
  )
}

export default Header