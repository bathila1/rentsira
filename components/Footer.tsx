import { settingsData } from '@/settings'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--neutral-950)',
      color: 'var(--neutral-500)',
      borderTop: '1px solid var(--neutral-800)',
      marginTop: 'var(--space-16)',
    }}>
      <div className="container" style={{ padding: 'var(--space-10) var(--space-4)' }}>

        {/* Top row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
        }}>

          {/* Brand */}
          <div>
            <div className="nav-brand" style={{
              color: 'var(--neutral-0)',
              marginBottom: 'var(--space-2)',
              fontSize: '1.3rem'
            }}>
              {settingsData.LogoTextFirstPart}<span>{settingsData.LogoTextLastPart}</span>
            </div>
            <p style={{
              fontSize: '0.83rem',
              color: 'var(--neutral-500)',
              maxWidth: '240px',
              lineHeight: 1.6
            }}>
              Sri Lanka's premier vehicle rental platform.
              Find the right vehicle for every journey.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 'var(--space-10)', flexWrap: 'wrap' }}>
            <div>
              <p style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--neutral-400)',
                marginBottom: 'var(--space-3)',
                fontFamily: 'var(--font-body)',
              }}>
                Platform
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Link href="/explore"  className="footer-link">Browse Vehicles</Link>
                <Link href="/login"    className="footer-link">Add Your Vehicle</Link>
                <Link href="/contact" className="footer-link">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--neutral-800)', paddingTop: 'var(--space-6)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', textAlign: 'center' }}>
            {settingsData.FooterText}
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer