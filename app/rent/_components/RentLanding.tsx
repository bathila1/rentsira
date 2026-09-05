import Link from "next/link";
import { createPublicClient } from "@/utils/supabase/public";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VehicleCard from "@/app/(user)/explore/components/VehicleCard";
import RequestButton from "@/components/RequestButton";
import JsonLd from "@/components/JsonLd";
import type { VehicleFacetRow, VehicleRow } from "@/utils/types";
import {
  breadcrumbJsonLd,
  escapeLike,
  faqJsonLd,
  itemListJsonLd,
  slugify,
} from "@/utils/seo";

/** Columns the cards actually render — never `select("*")` on a public page. */
export const CARD_COLUMNS =
  "id, make, model, year, type, district, daily_rate, fuel_type, seat_count, with_driver, image_urls, bumped_until";

const MAX_CARDS = 24;

export type LandingData = {
  vehicles: VehicleRow[];
  total: number;
  minRate: number | null;
  typesAvailable: string[];
};

/**
 * Loads everything a landing page needs in two queries:
 *   1. the cards to display (capped, with an exact count)
 *   2. a narrow type/rate projection used for the price line and cross-links
 */
export async function loadLandingData(
  district: string,
  type?: string,
): Promise<LandingData> {
  const supabase = createPublicClient();

  let cardQuery = supabase
    .from("uploaded_rent_vehicles")
    .select(CARD_COLUMNS, { count: "exact" })
    .ilike("district", escapeLike(district));

  // Case-insensitive exact match, so a listing stored as "car" still counts
  // towards the "Car" landing page.
  if (type) cardQuery = cardQuery.ilike("type", escapeLike(type));

  const [cardsRes, facetRes] = await Promise.all([
    cardQuery
      .order("bumped_until", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(MAX_CARDS),
    supabase
      .from("uploaded_rent_vehicles")
      .select("type, daily_rate")
      .ilike("district", escapeLike(district)),
  ]);

  const facets = (facetRes.data ?? []) as VehicleFacetRow[];

  const relevantRates = facets
    .filter((f) => !type || f.type?.toLowerCase() === type.toLowerCase())
    .map((f) => f.daily_rate)
    .filter((r): r is number => typeof r === "number" && r > 0);

  return {
    vehicles: (cardsRes.data ?? []) as unknown as VehicleRow[],
    total: cardsRes.count ?? 0,
    minRate: relevantRates.length ? Math.min(...relevantRates) : null,
    typesAvailable: [
      ...new Set(facets.map((f) => f.type).filter((t): t is string => !!t)),
    ],
  };
}

function buildFaqs(district: string, type: string | undefined, minRate: number | null) {
  const noun = type ? type.toLowerCase() : "vehicle";

  return [
    {
      q: `How much does it cost to rent a ${noun} in ${district}?`,
      a: minRate
        ? `Rates in ${district} start from around Rs. ${minRate.toLocaleString()} per day. The final price depends on the model, the year, whether you need a driver, and how many days you rent for. Weekly and monthly rates are usually cheaper per day.`
        : `Prices vary by model, year and rental length. Send us a request and we will come back to you with the current rates in ${district}.`,
    },
    {
      q: `Can I rent a ${noun} with a driver in ${district}?`,
      a: `Yes. Many owners in ${district} offer their vehicle with a driver, which is the usual choice for weddings, airport transfers and long day trips. Use the "With Driver" filter to see only those listings.`,
    },
    {
      q: `What documents do I need to rent a ${noun} in Sri Lanka?`,
      a: `For self-drive rentals you normally need a valid Sri Lankan driving licence (or an international driving permit recognised by the AA of Sri Lanka), your NIC or passport, and a refundable deposit. Requirements are set by each owner, so confirm before you book.`,
    },
    {
      q: `Do I pay a booking fee?`,
      a: `No. Renta.lk lists vehicles from owners across Sri Lanka and puts you in touch with them directly. You arrange the rental and payment with the owner, and we do not add a commission on top.`,
    },
  ];
}

export default async function RentLanding({
  district,
  type,
  data,
  allDistricts,
}: {
  district: string;
  type?: string;
  data: LandingData;
  allDistricts: readonly string[];
}) {
  const { vehicles, total, minRate, typesAvailable } = data;

  const noun = type ?? "Vehicle";
  const nounPlural = type ? `${type}s` : "Vehicles";
  const faqs = buildFaqs(district, type, minRate);

  const trail = [
    { name: "Home", path: "/" },
    { name: `Rent in ${district}`, path: `/rent/${slugify(district)}` },
    ...(type
      ? [
          {
            name: `${noun} for rent`,
            path: `/rent/${slugify(district)}/${slugify(type)}`,
          },
        ]
      : []),
  ];

  // Cross-links to the nearest few districts keep these pages connected to each
  // other, which is how the crawler discovers and ranks the whole set.
  const otherDistricts = allDistricts
    .filter((d) => d !== district)
    .slice(0, 12);

  return (
    <div className="page">
      <Header />

      <main className="container" style={{ padding: "var(--space-6) var(--space-4)" }}>
        {/* ─── Breadcrumbs ─── */}
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          {trail.map((crumb, i) => (
            <span key={crumb.path}>
              {i > 0 && <span aria-hidden="true"> › </span>}
              {i === trail.length - 1 ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <Link href={crumb.path}>{crumb.name}</Link>
              )}
            </span>
          ))}
        </nav>

        {/* ─── H1 targets the search query verbatim ─── */}
        <header style={{ marginBottom: "var(--space-6)" }}>
          <h1 className="landing-title">
            Rent a {noun} in {district}
          </h1>

          <p className="landing-sub">
            {total > 0 ? (
              <>
                <strong>{total}</strong> {nounPlural.toLowerCase()} available for
                rent in {district}
                {minRate
                  ? ` from Rs. ${minRate.toLocaleString()} per day`
                  : ""}
                . With or without a driver — contact the owner directly, no
                booking fee.
              </>
            ) : (
              <>
                We do not have a {noun.toLowerCase()} listed in {district} right
                now. Send us a request and we will find one for you.
              </>
            )}
          </p>

          <div className="landing-cta">
            <RequestButton />
          </div>
        </header>

        {/* ─── Type cross-links ─── */}
        {typesAvailable.length > 1 && (
          <section
            aria-label={`Other vehicle types in ${district}`}
            className="chip-row"
          >
            <Link
              href={`/rent/${slugify(district)}`}
              className={`chip ${!type ? "chip-active" : ""}`}
            >
              All types
            </Link>
            {typesAvailable.map((t) => (
              <Link
                key={t}
                href={`/rent/${slugify(district)}/${slugify(t)}`}
                className={`chip ${type === t ? "chip-active" : ""}`}
              >
                {t}
              </Link>
            ))}
          </section>
        )}

        {/* ─── Listings ─── */}
        {vehicles.length > 0 ? (
          <>
            <div className="vehicle-grid">
              {vehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} priority={i < 4} />
              ))}
            </div>

            {total > vehicles.length && (
              <div style={{ textAlign: "center", marginTop: "var(--space-8)" }}>
                <Link
                  href={`/explore?district=${encodeURIComponent(district)}${
                    type ? `&type=${encodeURIComponent(type)}` : ""
                  }`}
                  className="btn btn-primary btn-lg"
                >
                  See all {total} {nounPlural.toLowerCase()} in {district}
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">🚘</span>
            <p className="empty-state-sub">
              Nothing listed in {district} yet — tell us what you need and we
              will match you with an owner.
            </p>
            <RequestButton />
          </div>
        )}

        {/* ─── Body copy: gives the page something real to rank on ─── */}
        <section className="landing-copy">
          <h2>Renting a {noun.toLowerCase()} in {district}</h2>
          <p>
            {district} is one of the 25 districts we cover across Sri Lanka.
            Listings here come from local owners rather than a single fleet, so
            you will see a mix of budget, family and premium{" "}
            {nounPlural.toLowerCase()} at different daily rates. Every listing
            shows the daily price, the year, the fuel type, the seat count and
            whether a driver is included, so you can compare before you call.
          </p>
          <p>
            Once you find something suitable, you contact the owner directly by
            phone or WhatsApp. There is no booking fee and no commission — you
            agree the price, the dates and the deposit with the owner.
          </p>

          <h2>Frequently asked questions</h2>
          <dl className="faq-list">
            {faqs.map((f) => (
              <div key={f.q} className="faq-item">
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>

          <h2>Rent a vehicle in other districts</h2>
          <ul className="district-links">
            {otherDistricts.map((d) => (
              <li key={d}>
                <Link href={`/rent/${slugify(d)}`}>Rent a vehicle in {d}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />

      <JsonLd
        data={[
          breadcrumbJsonLd(trail),
          faqJsonLd(faqs),
          ...(vehicles.length ? [itemListJsonLd(vehicles)] : []),
        ]}
      />
    </div>
  );
}
