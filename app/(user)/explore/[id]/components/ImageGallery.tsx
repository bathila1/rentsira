'use client'

import { useState } from 'react'

export default function ImageGallery({ images }: { images: string[] }) {
  const [selected,  setSelected]  = useState(0)
  const [isZoomed,  setIsZoomed]  = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)

  if (images.length === 0) return (
    <div style={{
      width: '100%', aspectRatio: '16/10',
      background: 'var(--bg-subtle)',
      borderRadius: 'var(--radius-2xl)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '3rem',
      color: 'var(--neutral-300)',
      border: '1px solid var(--border-default)',
    }}>
      🚗
    </div>
  )

  const prev = () => setSelected((s) => (s - 1 + images.length) % images.length)
  const next = () => setSelected((s) => (s + 1) % images.length)

  // ─── Swipe support ───
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStart(x)
  }
  const onDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStart === null) return
    const x = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const diff = dragStart - x
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    setDragStart(null)
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

        {/* ─── MAIN IMAGE ─── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/10',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
            background: 'var(--neutral-900)',
            cursor: 'zoom-in',
            userSelect: 'none',
            boxShadow: 'var(--shadow-lg)',
          }}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          onClick={() => setIsZoomed(true)}
        >
          {/* Images — all rendered, only selected visible */}
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Vehicle photo ${i + 1}`}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: i === selected ? 1 : 0,
                transform: i === selected ? 'scale(1)' : 'scale(1.03)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Dark gradient bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '90px',
            background: 'linear-gradient(to top, rgb(0 0 0 / 0.5), transparent)',
            pointerEvents: 'none',
          }} />

          {/* ─── Prev / Next arrows ─── */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                style={{
                  position: 'absolute', left: 'var(--space-3)',
                  top: '50%', transform: 'translateY(-50%)',
                  width: '38px', height: '38px',
                  borderRadius: '50%',
                  background: 'rgb(255 255 255 / 0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgb(255 255 255 / 0.2)',
                  color: 'white', fontSize: '1.1rem',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition-fast)',
                  zIndex: 2,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(255 255 255 / 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(255 255 255 / 0.15)'}
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                style={{
                  position: 'absolute', right: 'var(--space-3)',
                  top: '50%', transform: 'translateY(-50%)',
                  width: '38px', height: '38px',
                  borderRadius: '50%',
                  background: 'rgb(255 255 255 / 0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgb(255 255 255 / 0.2)',
                  color: 'white', fontSize: '1.1rem',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition-fast)',
                  zIndex: 2,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(255 255 255 / 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgb(255 255 255 / 0.15)'}
              >
                ›
              </button>
            </>
          )}

          {/* ─── Bottom bar: dots + counter ─── */}
          <div style={{
            position: 'absolute', bottom: 'var(--space-3)',
            left: 0, right: 0, zIndex: 2,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 'var(--space-2)',
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelected(i) }}
                style={{
                  height: '3px',
                  width: i === selected ? '24px' : '8px',
                  borderRadius: 'var(--radius-full)',
                  background: i === selected
                    ? 'var(--color-primary)'
                    : 'rgb(255 255 255 / 0.45)',
                  border: 'none', padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Counter badge */}
          <div style={{
            position: 'absolute', top: 'var(--space-3)',
            right: 'var(--space-3)', zIndex: 2,
          }}>
            <span className="badge badge-dark" style={{
              backdropFilter: 'blur(8px)',
              background: 'rgb(0 0 0 / 0.45)',
              border: '1px solid rgb(255 255 255 / 0.15)',
              color: 'white',
            }}>
              {selected + 1} / {images.length}
            </span>
          </div>

          {/* Zoom hint */}
          <div style={{
            position: 'absolute', top: 'var(--space-3)',
            left: 'var(--space-3)', zIndex: 2,
          }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: 'rgb(255 255 255 / 0.7)',
              background: 'rgb(0 0 0 / 0.3)',
              backdropFilter: 'blur(6px)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-body)',
            }}>
              🔍 Click to zoom
            </span>
          </div>
        </div>

        {/* ─── THUMBNAIL STRIP ─── */}
        {images.length > 1 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${images.length}, 1fr)`,
            gap: 'var(--space-2)',
          }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: i === selected
                    ? '2.5px solid var(--color-primary)'
                    : '2px solid transparent',
                  padding: 0,
                  cursor: 'pointer',
                  opacity: i === selected ? 1 : 0.55,
                  transform: i === selected ? 'scale(1)' : 'scale(0.97)',
                  transition: 'all 0.2s ease',
                  boxShadow: i === selected ? 'var(--shadow-red)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (i !== selected) e.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={(e) => {
                  if (i !== selected) e.currentTarget.style.opacity = '0.55'
                }}
              >
                <img
                  src={img}
                  alt={`Thumb ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── LIGHTBOX / ZOOM ─── */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgb(0 0 0 / 0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 'var(--space-4)',
            cursor: 'zoom-out',
            animation: 'fade-in 0.2s ease',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsZoomed(false)}
            style={{
              position: 'fixed', top: 'var(--space-4)', right: 'var(--space-4)',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgb(255 255 255 / 0.1)',
              border: '1px solid rgb(255 255 255 / 0.2)',
              color: 'white', fontSize: '1.2rem',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            ✕
          </button>

          {/* Prev in lightbox */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              style={{
                position: 'fixed', left: 'var(--space-4)',
                top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgb(255 255 255 / 0.1)',
                border: '1px solid rgb(255 255 255 / 0.2)',
                color: 'white', fontSize: '1.5rem',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              ‹
            </button>
          )}

          {/* Full image */}
          <img
            src={images[selected]}
            alt={`Zoomed view ${selected + 1}`}
            style={{
              maxWidth: '90vw', maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 60px rgb(0 0 0 / 0.5)',
              animation: 'fade-in-scale 0.25s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next in lightbox */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              style={{
                position: 'fixed', right: 'var(--space-4)',
                top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgb(255 255 255 / 0.1)',
                border: '1px solid rgb(255 255 255 / 0.2)',
                color: 'white', fontSize: '1.5rem',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              ›
            </button>
          )}

          {/* Counter in lightbox */}
          <div style={{
            position: 'fixed', bottom: 'var(--space-6)',
            left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 'var(--space-2)',
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelected(i) }}
                style={{
                  height: '3px',
                  width: i === selected ? '28px' : '8px',
                  borderRadius: 'var(--radius-full)',
                  background: i === selected
                    ? 'var(--color-primary)'
                    : 'rgb(255 255 255 / 0.35)',
                  border: 'none', padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}