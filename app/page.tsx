import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Search from '@/components/Search'
import { settingsData } from '@/settings'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SIRAA — Vehicle Rental Platform Sri Lanka',
  description: 'Browse hundreds of vehicles for rent across all 25 districts. Cars, vans, SUVs — with or without a driver.',
}

export default async function Home() {
  const supabase = await createClient()

  const { data: vehicles, count } = await supabase
    .from('uploaded_rent_vehicles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="page">
      <Header />

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

          <div className="hero-eyebrow">
            🇱🇰 Sri Lanka's Vehicle Rental Platform
          </div>

          <h1 className="hero-title">
            Find Your Perfect<br />
            <span className="accent">Rental Vehicle</span>
          </h1>

          <p className="hero-sub" style={{ margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            {settingsData.FrontPageMainSmallText}
          </p>

          {/* Search */}
          <div style={{ maxWidth: '720px', margin: '0 auto var(--space-12)' }}>
            <Search />
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-8)',
            flexWrap: 'wrap',
          }}>
            <div className="stat-pill">
              <div className="stat-pill-value">{count?.toLocaleString()}+</div>
              <div className="stat-pill-label">Vehicles Listed</div>
            </div>

            {/* <div style={{ width: '1px', height: '36px', background: 'rgb(255 255 255 / 0.1)' }} /> 
            <div className="stat-pill">
              <div className="stat-pill-value">25</div>
              <div className="stat-pill-label">Districts</div>
            </div> */}
            {/* <div style={{ width: '1px', height: '36px', background: 'rgb(255 255 255 / 0.1)' }} /> */}
            {/* <div className="stat-pill">
              <div className="stat-pill-value">7</div>
              <div className="stat-pill-label">Vehicle Types</div>
            </div> */}
          </div>
        </div>
      </section>

      {/* ─── FEATURED VEHICLES ─── */}
      <section style={{ padding: 'var(--space-16) 0' }}>
        <div className="container">

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <div>
              <p className="label">Recently Added</p>
              <h2 style={{ marginTop: 'var(--space-1)' }}>Latest Listings</h2>
            </div>
            <Link href="/explore" className="btn btn-ghost btn-sm">
              View All {'→'}
            </Link>
          </div>

          {/* Vehicle Grid */}
          <div className="stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {vehicles?.map((car) => (
              <Link
                key={car.id}
                href={`/explore/${car.id}`}
                className="vehicle-card animate-fade-in"
              >
                {/* Image */}
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                  {car.image_urls?.[0] ? (
                    <img
                      src={car.image_urls[0]}
                      alt={`${car.make} ${car.model}`}
                      className="vehicle-card-image"
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '2.5rem',
                      color: 'var(--neutral-300)'
                    }}>
                      🚗
                    </div>
                  )}

                  {/* Type badge */}
                  <span className="badge badge-dark" style={{
                    position: 'absolute', top: '10px', left: '10px',
                    backdropFilter: 'blur(8px)',
                  }}>
                    {car.type}
                  </span>

                  {/* Driver badge */}
                  {car.with_driver && (
                    <span className="badge badge-red" style={{
                      position: 'absolute', top: '10px', right: '10px',
                    }}>
                      👨‍✈️ Driver
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="vehicle-card-body">
                  <div className="vehicle-card-title">
                    {car.make} {car.model}{' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                      ({car.year})
                    </span>
                  </div>
                  <div className="vehicle-card-sub">📍 {car.district}</div>

                  <div style={{
                    marginTop: 'var(--space-3)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div className="vehicle-card-price">
                      Rs. {car.daily_rate?.toLocaleString()}
                      <span>/day</span>
                    </div>
                    <span className="badge badge-gray">{car.fuel_type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
            <Link href="/explore" className="btn btn-primary btn-lg">
              Browse All Vehicles 🚀
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}