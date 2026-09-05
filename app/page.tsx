import { createPublicClient } from "@/utils/supabase/public";
import Link from "next/link";
import type { Metadata } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Search from "@/components/Search";
import SearchBarBig from "@/components/SearchBarBig";
import RequestButton from "@/components/RequestButton";
import JsonLd from "@/components/JsonLd";
import VehicleCard from "@/app/(user)/explore/components/VehicleCard";
import UnderConstructionBanner from "@/components/UnderConstructionBanner";
import Reveal from "@/components/Reveal";

import { settingsData, dynamicData } from "@/settings";
import { absoluteUrl, faqJsonLd, slugify } from "@/utils/seo";

/**
 * The "coming soon" popup is switched off for the production launch.
 *
 * The component and this flag are both kept so it can be brought back for the
 * next maintenance window by flipping the constant to true.
 */
const SHOW_UNDER_CONSTRUCTION_POPUP = false;

// The homepage shows the newest listings. Rebuilding every 10 minutes serves
// almost every visitor from cache instead of querying on each request.
export const revalidate = 600;

const title =
  "Rent a Car in Sri Lanka — Cars, Vans & SUVs With or Without Driver";
const description =
  "Rent a car, van, SUV or bus anywhere in Sri Lanka. Compare daily rates from local owners in all 25 districts, with or without a driver. Contact the owner directly — no booking fee.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/"),
    images: [{ url: settingsData.FrontPageMainImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [settingsData.FrontPageMainImage],
  },
};

/** Districts people search for most — these become the main internal links. */
const POPULAR_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kandy",
  "Galle",
  "Kurunegala",
  "Kalutara",
  "Matara",
  "Jaffna",
  "Anuradhapura",
  "Ratnapura",
  "Badulla",
  "Puttalam",
];

const HOME_FAQS = [
  {
    q: "How do I rent a vehicle on Renta.lk?",
    a: "Search or browse the listings, open the one you want, then call or WhatsApp the owner directly using the button on the listing. You agree the dates, the price and the deposit with the owner. There is no booking fee and no commission.",
  },
  {
    q: "Can I rent a car in Sri Lanka without a driver?",
    a: "Yes. Many owners offer self-drive rentals. You will normally need a valid Sri Lankan driving licence or a recognised international driving permit, your NIC or passport, and a refundable deposit. Use the 'Without Driver' filter to see only self-drive listings.",
  },
  {
    q: "How much does it cost to rent a car in Sri Lanka?",
    a: "Rates depend on the model, the year, the district and whether a driver is included. Small hatchbacks are the cheapest, while vans, SUVs and wedding cars cost more. Every listing shows its daily rate, and weekly or monthly hire usually works out cheaper per day.",
  },
  {
    q: "Can I list my own vehicle for rent?",
    a: "Yes, and it is free. Create an account, verify your phone number and post your vehicle with photos and your rates. Renters contact you directly.",
  },
  {
    q: "Which areas do you cover?",
    a: "All 25 districts of Sri Lanka, including Colombo, Gampaha, Kandy, Galle, Kurunegala, Jaffna and Matara.",
  },
];

export default async function Home() {
  // Public data only, so no cookies — this keeps the page prerenderable.
  const supabase = createPublicClient();

  // Only the columns the cards render, and no `count: "exact"` — the count was
  // making Postgres scan the whole table for a statistic the page then never
  // displayed (the stat block that used it is commented out below).
  const { data: vehicles } = await supabase
    .from("uploaded_rent_vehicles")
    .select(
      "id, make, model, year, type, district, daily_rate, fuel_type, seat_count, with_driver, image_urls, bumped_until",
    )
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="page">
      <Header />

      {SHOW_UNDER_CONSTRUCTION_POPUP && <UnderConstructionBanner />}

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="hero">
        {/* Slow colour blooms behind the copy. Purely decorative and
            pointer-events:none, so they never intercept a tap. */}
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />

        <div className="container hero-inner">
          <p className="hero-eyebrow hero-rise hero-rise-1">
            🇱🇰 Vehicle rentals across Sri Lanka
          </p>

          {/* The H1 is the target query in plain words, not a slogan. */}
          <h1 className="hero-title hero-rise hero-rise-2">
            Rent a vehicle
            <br />
            <span className="accent">Vehicles for Rent</span>
          </h1>

          {/* <p className="hero-sub">
            Cars, vans, SUVs and buses from local owners in all 25 districts —
            with or without a driver. Contact the owner directly, no booking fee.
          </p> */}

          <div className="hero-actions hero-rise hero-rise-3">
            <SearchBarBig />

            <p className="hero-or"> </p>

            <Search />

            <div className="hero-request">
              <p className="hero-request-text">
                Can’t find what you need? Tell us and we’ll find it for you.
              </p>
              <RequestButton />
            </div>
          </div>

          {/* Answers the three things a renter wants to know before they
              trust a listings site, without needing any live numbers. */}
          <div className="trust-strip hero-rise hero-rise-4">
            <span className="trust-item">
              <span aria-hidden="true">📍</span>
              <strong>25</strong> districts covered
            </span>
            <span className="trust-item">
              <span aria-hidden="true">🤝</span>
              <strong>No</strong> booking fee
            </span>
            <span className="trust-item">
              <span aria-hidden="true">📞</span>
              Contact owners <strong>directly</strong>
            </span>
          </div>

          <div className="scroll-cue hero-rise hero-rise-4" aria-hidden="true">
            Scroll
            <span aria-hidden="true">↓</span>
          </div>
        </div>
      </section>

      {/* ───────────────── POPULAR LOCATIONS ─────────────────
          These are the site's main internal links. Each one points at a
          landing page built for the way people actually search. */}
      <section className="section">
        <div className="container">
          <Reveal>
            <h2 className="section-title section-title-accent">
              Rent a vehicle by city
            </h2>
            <p className="section-sub">
              Browse vehicles available for rent in Sri Lanka’s main districts.
            </p>
          </Reveal>

          <div className="tile-grid">
            {POPULAR_DISTRICTS.map((district, i) => (
              // Capped stagger: past ~8 tiles the delay starts to feel like lag
              // rather than polish.
              <Reveal key={district} delay={Math.min(i, 7) * 60}>
                <Link href={`/rent/${slugify(district)}`} className="tile">
                  <span className="tile-icon" aria-hidden="true">
                    📍
                  </span>
                  <span className="tile-label">Rent a car in {district}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── BROWSE BY TYPE ───────────────── */}
      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <h2 className="section-title section-title-accent">
              Browse by vehicle type
            </h2>
            <p className="section-sub">
              From a small hatchback for the week to a bus for a group trip.
            </p>
          </Reveal>

          <div className="chip-row">
            {dynamicData.vehicle_types.map((type, i) => (
              <Reveal key={type} delay={Math.min(i, 7) * 50}>
                <Link
                  href={`/explore?type=${encodeURIComponent(type)}`}
                  className="chip"
                >
                  {type}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── LATEST LISTINGS ───────────────── */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <h2 className="section-title section-title-accent">
                  Latest vehicles for rent
                </h2>
                <p className="section-sub">Recently added by owners.</p>
              </div>
              <Link href="/explore" className="btn btn-secondary btn-sm">
                View all
              </Link>
            </div>
          </Reveal>

          {vehicles && vehicles.length > 0 ? (
            <div className="vehicle-grid">
              {vehicles.map((car, i) => (
                <Reveal key={car.id} delay={Math.min(i, 7) * 60}>
                  <VehicleCard vehicle={car as any} priority={i < 4} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">🚘</span>
              <p className="empty-state-sub">
                No listings yet. Tell us what you need and we’ll find it.
              </p>
              <RequestButton />
            </div>
          )}
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <h2 className="section-title section-title-accent">How it works</h2>
            <p className="section-sub">
              Three steps, no account needed to rent.
            </p>
          </Reveal>

          <ol className="steps">
            <Reveal as="li" className="step" delay={0}>
              <span className="step-num">1</span>
              <h3 className="step-title">Search</h3>
              <p className="step-text">
                Filter by district, vehicle type, seats and whether you want a
                driver.
              </p>
            </Reveal>
            <Reveal as="li" className="step" delay={110}>
              <span className="step-num">2</span>
              <h3 className="step-title">Compare</h3>
              <p className="step-text">
                Every listing shows the daily rate, year, fuel type and photos —
                so you can compare before you call.
              </p>
            </Reveal>
            <Reveal as="li" className="step" delay={220}>
              <span className="step-num">3</span>
              <h3 className="step-title">Contact the owner</h3>
              <p className="step-text">
                Call or WhatsApp the owner directly and agree the details. No
                booking fee, no middleman.
              </p>
            </Reveal>
          </ol>
        </div>
      </section>

      {/* ───────────────── OWNER CTA ───────────────── */}
      <section className="section">
        <div className="container">
          <Reveal className="owner-cta">
            <div>
              <h2 className="section-title" style={{ marginBottom: "8px" }}>
                Own a vehicle? List it free
              </h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>
                Reach renters across Sri Lanka. Posting a listing costs nothing.
              </p>
            </div>
            <Link href="/get-started" className="btn btn-primary btn-lg">
              Post your vehicle free
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── FAQ ─────────────────
          Real answers to the questions people search for, which is what the
          FAQ structured data below is built from. */}
      <section className="section section-alt">
        <div className="container">
          <Reveal>
            <h2 className="section-title section-title-accent">
              Common questions
            </h2>
          </Reveal>

          <dl className="faq-list" style={{ maxWidth: "75ch" }}>
            {HOME_FAQS.map((f, i) => (
              <Reveal key={f.q} className="faq-item" delay={Math.min(i, 5) * 70}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Footer />

      <JsonLd data={faqJsonLd(HOME_FAQS)} />
    </div>
  );
}
