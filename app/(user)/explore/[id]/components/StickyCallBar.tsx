export default function StickyCallBar({
  phone,
  sellerName,
  vehicle,
}: {
  phone: string | null
  sellerName: string
  vehicle: string
}) {
  const visible = true
  // Normalizes any Sri Lankan phone format to WhatsApp-ready international format
function toWAPhone(phone: string): string {
  // Remove everything except digits
  let digits = phone.replace(/\D/g, '')

  // Remove leading 0  → 0771234567 becomes 771234567
  if (digits.startsWith('0')) digits = digits.slice(1)

  // Remove leading 94 then re-add → prevents 9494...
  if (digits.startsWith('94')) digits = digits.slice(2)

  // Always prefix with Sri Lanka country code
  return `94${digits}`
}

  if (!phone) return null

  const waMessage = encodeURIComponent(
    `Hi! I'm interested in your ${vehicle} listed on SIRAA. Is it still available?`
  )
  const phoneDigits = toWAPhone(phone)

  return (
    <div
      className="sticky-call-bar"
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        padding: 'var(--space-3) var(--space-4)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        boxShadow: '0 -4px 24px rgb(0 0 0 / 0.08)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Renter info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.72rem', color: 'var(--text-tertiary)',
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          Vehicle Owner
        </p>
        <p style={{
          fontSize: '0.875rem', fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.01em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {sellerName}
        </p>
        <p style={{
          fontSize: '0.72rem', color: 'var(--text-tertiary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {vehicle}
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${phoneDigits}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            textDecoration: 'none',
            background: '#25D366',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgb(37 211 102 / 0.3)',
            paddingLeft: 'var(--space-4)',
            paddingRight: 'var(--space-4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.842L.057 23.571a.75.75 0 0 0 .921.921l5.733-1.452A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.355l-.355-.211-3.683.933.951-3.68-.23-.373A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
          </svg>
        </a>

        {/* Call */}
        <a
          href={`tel:${phone}`}
          className="btn btn-primary"
          style={{
            textDecoration: 'none',
            paddingLeft: 'var(--space-5)',
            paddingRight: 'var(--space-5)',
          }}
        >
          📞 Call Now
        </a>

      </div>
    </div>
  )
}