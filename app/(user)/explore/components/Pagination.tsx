'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', p.toString())
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: number[] = []
    const start = Math.max(1, page - 2)
    const end   = Math.min(totalPages, start + 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="pagination">

      {/* First */}
      {page > 3 && (
        <>
          <button onClick={() => goTo(1)} className="pagination-btn">1</button>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>···</span>
        </>
      )}

      {/* Prev */}
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
        className="pagination-btn"
      >
        {'←'}
      </button>

      {/* Numbers */}
      {getPageNumbers().map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={`pagination-btn ${p === page ? 'active' : ''}`}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
        className="pagination-btn"
      >
        {'→'}
      </button>

      {/* Last */}
      {page < totalPages - 2 && (
        <>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>···</span>
          <button onClick={() => goTo(totalPages)} className="pagination-btn">{totalPages}</button>
        </>
      )}

      {/* Label */}
      <span style={{
        width: '100%', textAlign: 'center',
        fontSize: '0.75rem', color: 'var(--text-tertiary)',
        marginTop: 'var(--space-2)',
      }}>
        Page {page} of {totalPages}
      </span>
    </div>
  )
}