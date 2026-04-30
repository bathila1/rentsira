import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Footer from "@/components/Footer";
import Search from "@/components/Search";
import { settingsData } from "@/settings";

import type { Metadata } from "next";
import SearchBarBig from "@/components/SearchBarBig";

const title = "SIRAA — Vehicle Rental Platform Sri Lanka";
const description =
  "Find and rent cars, vans, SUVs and more across all 25 districts in Sri Lanka. With or without driver.";
const image = settingsData.FrontPageMainImage;

export const metadata: Metadata = {
  title: title,
  description: description,

  // ─── Open Graph (WhatsApp, Facebook previews) ───
  openGraph: {
    title,
    description,
    images: [{ url: image, width: 1200, height: 630 }],
    type: "website",
  },

  // ─── Twitter card ───
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default async function Home() {
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  const supabase = await createClient();

  const { data: vehicles, count } = await supabase
    .from("uploaded_rent_vehicles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="page">
      {/* <Header /> */}

      {/* ─── HERO ─── */}
      <section className="hero">
        <div>
          <Link
            href="/get-started"
            className="btn btn-primary btn-sm"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              position: "absolute",
              top: "var(--space-4)", // Spacing from top
              right: "var(--space-4)", // Spacing from right
              zIndex: 10,
              //end right
            }}
          >
            Post Free
          </Link>
        </div>
        <div
          className="container"
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <div className="hero-eyebrow">
            🇱🇰 Sri Lanka's Vehicle Rental Platform
          </div>

          <h1 className="hero-title">
            Find Your Perfect
            <br />
            <span className="accent">Rental Vehicle</span>
          </h1>

          {/* <p
            className="hero-sub"
            style={{
              margin: "0 auto",
              textAlign: "center",
              marginBottom: "var(--space-10)",
            }}
          >
            {settingsData.FrontPageMainSmallText}
          </p> */}
          <a
            href="/book"
            className="book-now-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "var(--space-2) var(--space-3)",
              background: "radial-gradient(circle at top left, rgb(223, 11, 201), rgb(1, 204, 255))",
              borderRadius: "var(--radius-full)",
              textDecoration: "none",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.02em",
              marginBottom: "var(--space-2)",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2.4s ease infinite",
              }}
            />

            <span
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 5v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </span>

            <span style={{ position: "relative" }}> Request</span>
            <svg
              style={{ position: "relative", opacity: 0.8 }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

<div>
              <p style={{ color: 'white', maxWidth: 480, lineHeight: 1.6, marginBottom: 'var(--space-3)', marginLeft: 'auto', marginRight: 'auto' }}>
               Or
              </p>
</div>

          {/* Search */}
          <SearchBarBig />
          <div style={{ maxWidth: "720px", margin: "0 auto var(--space-12)" }}>
            <Search />
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "var(--space-8)",
              flexWrap: "wrap",
            }}
          >
            <div className="stat-pill">
              <div className="stat-pill-value">{count?.toLocaleString()}+</div>
              <div className="stat-pill-label">Vehicles Listed</div>
            </div>

            {/* <div style={{ width: '1px', height: '36px', backgroundColor: 'rgb(255 255 255 / 0.1)' }} /> 
            <div className="stat-pill">
              <div className="stat-pill-value">25</div>
              <div className="stat-pill-label">Districts</div>
            </div> */}
            {/* <div style={{ width: '1px', height: '36px', backgroundColor: 'rgb(255 255 255 / 0.1)' }} /> */}
            {/* <div className="stat-pill">
              <div className="stat-pill-value">7</div>
              <div className="stat-pill-label">Vehicle Types</div>
            </div> */}
          </div>
        </div>
      </section>

      {/* ─── FEATURED VEHICLES ─── */}
      <section style={{ padding: "var(--space-16) 0" }}>
        <div className="container">
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "var(--space-8)",
            }}
          >
            <div>
              <p className="label">Recently Added</p>
              <h2 style={{ marginTop: "var(--space-1)" }}>Latest Listings</h2>
            </div>
            <Link href="/explore" className="btn btn-ghost btn-sm">
              View All {"→"}
            </Link>
          </div>

          {/* Vehicle Grid */}
          <div
            className="stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {vehicles?.map((car) => (
              <Link
                key={car.id}
                href={`/explore/${car.id}`}
                className="vehicle-card animate-fade-in"
              >
                {/* Image */}
                <div
                  style={{
                    position: "relative",
                    height: "100px",
                    overflow: "hidden",
                    backgroundColor: "var(--bg-subtle)",
                  }}
                >
                  {car.image_urls?.[0] ? (
                    <img
                      src={car.image_urls[0]}
                      alt={`${car.make} ${car.model}`}
                      className="vehicle-card-image"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        color: "var(--neutral-300)",
                      }}
                    >
                      🚗
                    </div>
                  )}

                  {/* Type badge */}
                  <span
                    className="badge badge-dark"
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {car.type}
                  </span>

                  {/* Driver badge */}
                  {car.with_driver && (
                    <span
                      className="badge badge-red"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                    >
                      👨‍✈️ With Driver
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="vehicle-card-body">
                  <div className="vehicle-card-title">
                    {car.make} {car.model}{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--text-tertiary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      ({car.year})
                    </span>
                  </div>
                  <div className="vehicle-card-sub">📍 {car.district}</div>

                  <div
                    style={{
                      marginTop: "var(--space-3)",
                      paddingTop: "var(--space-3)",
                      borderTop: "1px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
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
          <div style={{ textAlign: "center", marginTop: "var(--space-12)" }}>
            <Link href="/get-started" className="btn btn-primary btn-lg">
              🚗 Post Your Vehicle Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
