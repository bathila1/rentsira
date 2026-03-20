'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditImagesPage() {
  const { id }     = useParams()
  const router     = useRouter()
  const [imageUrls,      setImageUrls]      = useState<string[]>([])
  const [loading,        setLoading]        = useState(true)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [successIndex,   setSuccessIndex]   = useState<number | null>(null)

  useEffect(() => {
    async function fetchImages() {
      const { data, error } = await supabase
        .from('uploaded_rent_vehicles')
        .select('image_urls')
        .eq('id', id)
        .single()
      if (!error) setImageUrls(data.image_urls || [])
      setLoading(false)
    }
    fetchImages()
  }, [id])

  const handleReplaceImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploadingIndex(index)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}`
      await supabase.storage.from('vehicle-images').upload(filePath, file)
      const { data } = supabase.storage.from('vehicle-images').getPublicUrl(filePath)

      const updatedImages = [...imageUrls]
      updatedImages[index] = data.publicUrl

      const { error } = await supabase
        .from('uploaded_rent_vehicles')
        .update({ image_urls: updatedImages })
        .eq('id', id)

      if (!error) {
        setImageUrls(updatedImages)
        setSuccessIndex(index)
        setTimeout(() => setSuccessIndex(null), 2500)
      }
    } catch (err) {
      console.error(err)
      alert('Upload failed. Please try again.')
    } finally {
      setUploadingIndex(null)
    }
  }

  // ─── Loading ───
  if (loading) return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          border: '3px solid var(--red-100)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto var(--space-4)',
        }} />
        <p className="label">Loading gallery...</p>
      </div>
    </div>
  )

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-16)' }}>
      <div className="container-sm" style={{ paddingTop: 'var(--space-8)' }}>

        {/* ─── Header ─── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-8)',
          gap: 'var(--space-4)',
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>🖼️ Manage Images</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Replace individual photos — changes save instantly
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
            style={{ flexShrink: 0 }}
          >
            {'←'} Back
          </button>
        </div>

        {/* ─── Info banner ─── */}
        <div style={{
          background: 'var(--color-primary-light)',
          border: '1px solid var(--color-primary-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-6)',
          display: 'flex', alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <span style={{ fontSize: '1.1rem' }}>💡</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 500 }}>
            Click <strong>Replace</strong> under any photo to swap it.
            The first image is your <strong>cover photo</strong> shown in listings.
          </p>
        </div>

        {/* ─── Image Grid ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-4)',
        }}>
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="card animate-fade-in"
              style={{
                overflow: 'hidden',
                border: successIndex === index
                  ? '2px solid var(--color-success)'
                  : index === 0
                    ? '2px solid var(--color-primary)'
                    : '1px solid var(--border-default)',
                transition: 'var(--transition-normal)',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: '160px', background: 'var(--bg-subtle)' }}>
                <img
                  src={url}
                  alt={`Vehicle photo ${index + 1}`}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: uploadingIndex === index ? 0.4 : 1,
                    transition: 'var(--transition-normal)',
                  }}
                />

                {/* Cover badge */}
                {index === 0 && (
                  <span className="badge badge-red" style={{
                    position: 'absolute', top: '8px', left: '8px',
                  }}>
                    ★ Cover
                  </span>
                )}

                {/* Photo number */}
                {index !== 0 && (
                  <span className="badge badge-dark" style={{
                    position: 'absolute', top: '8px', left: '8px',
                    backdropFilter: 'blur(4px)',
                  }}>
                    {index + 1}
                  </span>
                )}

                {/* Uploading overlay */}
                {uploadingIndex === index && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgb(255 255 255 / 0.7)',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      border: '3px solid var(--red-100)',
                      borderTopColor: 'var(--color-primary)',
                      animation: 'spin 0.8s linear infinite',
                      marginBottom: 'var(--space-2)',
                    }} />
                    <p style={{
                      fontSize: '0.78rem', fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}>
                      Uploading...
                    </p>
                  </div>
                )}

                {/* Success overlay */}
                {successIndex === index && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgb(22 163 74 / 0.15)',
                    backdropFilter: 'blur(2px)',
                  }}>
                    <div style={{
                      background: 'var(--color-success)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px', height: '40px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}>
                      ✓
                    </div>
                  </div>
                )}
              </div>

              {/* Replace button */}
              <div style={{ padding: 'var(--space-3)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-default)',
                  background: 'var(--bg-subtle)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: uploadingIndex === index
                    ? 'var(--text-tertiary)'
                    : 'var(--text-secondary)',
                  cursor: uploadingIndex === index ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-fast)',
                  fontFamily: 'var(--font-body)',
                }}
                  onMouseEnter={(e) => {
                    if (uploadingIndex !== index) {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.color       = 'var(--color-primary)'
                      e.currentTarget.style.background  = 'var(--color-primary-light)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)'
                    e.currentTarget.style.color       = 'var(--text-secondary)'
                    e.currentTarget.style.background  = 'var(--bg-subtle)'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploadingIndex !== null}
                    onChange={(e) => handleReplaceImage(index, e)}
                  />
                  {uploadingIndex === index ? '⏳ Uploading...' : '🔄 Replace Photo'}
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Empty state ─── */}
        {imageUrls.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">📷</span>
            <p className="empty-state-title">No images found</p>
            <p className="empty-state-sub">This vehicle has no photos attached</p>
          </div>
        )}

        {/* ─── Bottom action ─── */}
        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <button
            onClick={() => router.back()}
            className="btn btn-primary btn-lg"
          >
            {'←'} Done — Back to Edit Details
          </button>
        </div>

      </div>
    </div>
  )
}