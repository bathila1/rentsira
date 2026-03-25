import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "./components/ImageGallery";
import StickyCallBar from "./components/StickyCallBar";
import type { Metadata } from "next";
import BackButton from "./components/BackBtn";

const SiteDomain = process.env.NEXT_PUBLIC_SITE_URL || "";

// Normalizes any Sri Lankan phone format to WhatsApp-ready international format
function toWAPhone(phone: string): string {
  // Remove everything except digits
  let digits = phone.replace(/\D/g, "");

  // Remove leading 0  → 0771234567 becomes 771234567
  if (digits.startsWith("0")) digits = digits.slice(1);

  // Remove leading 94 then re-add → prevents 9494...
  if (digits.startsWith("94")) digits = digits.slice(2);

  // Always prefix with Sri Lanka country code
  return `94${digits}`;
}

// ─── Dynamic metadata per vehicle ───
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const supabase = await createClient();
  const { id } = await params;

  const { data: vehicle } = await supabase
    .from("uploaded_rent_vehicles")
    .select(
      "make, model, year, district, daily_rate, fuel_type, with_driver, image_urls",
    )
    .eq("id", id)
    .single();

  if (!vehicle)
    return {
      title: "Vehicle Not Found | SIRAA",
    };

  const title = `${vehicle.make} ${vehicle.model} (${vehicle.year}) for Rent in ${vehicle.district}`;
  const description = `Rent a ${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.district} from Rs. ${vehicle.daily_rate?.toLocaleString()}/day. ${vehicle.with_driver ? "With Driver." : "Without Driver."} ${vehicle.fuel_type}. Book now on SIRAA.`;
  const image = vehicle.image_urls?.[0] || `https://cdn.jsdelivr.net/gh/bathila1/web-assets/og-default.jpg`;

  return {
    title,
    description,

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
}
export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: vehicle, error } = await supabase
    .from("uploaded_rent_vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (vehicle) {
    supabase.rpc("increment_view_count", { vehicle_id: id });
  }

  if (error || !vehicle) notFound();

  const { data: sellerProfile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", vehicle.seller_id)
    .single();

  const sellerName = sellerProfile?.full_name || "Renter";
  const sellerPhone = sellerProfile?.phone || null;

  const rates = [
    { label: "Daily Rate", value: vehicle.daily_rate, icon: "📅" },
    { label: "Weekly Rate", value: vehicle.weekly_rate, icon: "🗓️" },
    { label: "Monthly Rate", value: vehicle.monthly_rate, icon: "📆" },
  ].filter((r) => r.value);

  const specs = [
    { label: "Seats", value: vehicle.seat_count, icon: "🏷️" },
    { label: "Type", value: vehicle.type, icon: "🚘" },
    { label: "Make", value: vehicle.make, icon: "🏭" },
    { label: "Model", value: vehicle.model, icon: "🚗" },
    { label: "Year", value: vehicle.year, icon: "📅" },
    { label: "Fuel Type", value: vehicle.fuel_type, icon: "⛽" },
    { label: "District", value: vehicle.district, icon: "📍" },
    { label: "Description", value: vehicle.description || "-", icon: "📝" },
    {
      label: "Driver",
      value: vehicle.with_driver ? "With Driver" : "Without Driver",
      icon: "👤",
    },
  ];

  const isBumped =
    vehicle.bumped_until && new Date(vehicle.bumped_until) > new Date();

  return (
    <div className="page">
      <Header />

      <main
        className="container"
        style={{
          padding: "var(--space-8) var(--space-4)",
          paddingBottom: "calc(var(--space-8) + 80px)",
        }}
      >
        {/* ─── BACK ─── back */}
       <BackButton/>
        {/* ─── TOP GRID ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: "var(--space-8)",
            alignItems: "start",
          }}
        >
          {/* LEFT — Gallery */}
          <ImageGallery images={vehicle.image_urls || []} />

          {/* RIGHT — Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            {/* ─── Title ─── */}
            <div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-3)",
                }}
              >
                <span className="badge badge-gray">{vehicle.type}</span>
                {vehicle.with_driver && (
                  <span className="badge badge-green">👨‍✈️ With Driver</span>
                )}
                {isBumped && (
                  <span className="badge badge-red">🔥 Featured</span>
                )}
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {vehicle.make} {vehicle.model}
              </h1>

              <p style={{ fontSize: "0.9rem", color: "var(--text-tertiary)" }}>
                📍 {vehicle.district}
                <span
                  style={{
                    margin: "0 var(--space-2)",
                    color: "var(--border-strong)",
                  }}
                >
                  •
                </span>
                {vehicle.year}
                {vehicle.view_count > 0 && (
                  <>
                    <span
                      style={{
                        margin: "0 var(--space-2)",
                        color: "var(--border-strong)",
                      }}
                    >
                      •
                    </span>
                    👁️ {vehicle.view_count} views
                  </>
                )}
              </p>
            </div>

            {/* ─── RATES ─── */}
            {rates.length > 0 && (
              <div className="section-card">
                <p className="section-card-title">💰 Rental Rates</p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${rates.length}, 1fr)`,
                    gap: "var(--space-3)",
                  }}
                >
                  {rates.map((rate) => (
                    <div
                      key={rate.label}
                      style={{
                        textAlign: "center",
                        background: "var(--color-primary-light)",
                        border: "1px solid var(--color-primary-border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "var(--space-4) var(--space-3)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-tertiary)",
                          marginBottom: "var(--space-1)",
                          fontWeight: 600,
                        }}
                      >
                        {rate.icon} {rate.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "var(--color-primary)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Rs. {rate.value?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── SPECS ─── */}
            <div className="section-card">
              <p className="section-card-title">🔧 Specifications</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-4)",
                }}
              >
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-tertiary)",
                        fontWeight: 600,
                        marginBottom: "3px",
                      }}
                    >
                      {spec.icon} {spec.label}
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── CONTACT Renter ─── */}
            <div className="section-card">
              <p className="section-card-title">📞 Contact Renter</p>

              {/* Seller info row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-4)",
                  padding: "var(--space-3)",
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "var(--neutral-950)",
                    color: "var(--neutral-0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    flexShrink: 0,
                  }}
                >
                  {sellerName[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {sellerName}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Vehicle Owner
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              {sellerPhone ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                  }}
                >
                  {/* Call */}
                  <a
                    href={`tel:${sellerPhone}`}
                    className="btn btn-primary btn-full btn-lg"
                    style={{ textDecoration: "none", justifyContent: "center" }}
                  >
                    📞 Call
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${toWAPhone(sellerPhone)}?text=${encodeURIComponent(
                      `Hi! I'm interested in your ${vehicle.make} ${vehicle.model} (${vehicle.year}) listed on SIRAA. Is it still available?`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-full btn-lg"
                    style={{
                      textDecoration: "none",
                      justifyContent: "center",
                      background: "#25D366",
                      color: "white",
                      boxShadow: "0 4px 14px 0 rgb(37 211 102 / 0.3)",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.842L.057 23.571a.75.75 0 0 0 .921.921l5.733-1.452A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.355l-.355-.211-3.683.933.951-3.68-.23-.373A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              ) : (
                <div
                  style={{
                    padding: "var(--space-4)",
                    textAlign: "center",
                    background: "var(--bg-subtle)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px dashed var(--border-default)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    📵 No contact number available
                  </p>
                </div>
              )}

              {/* Share via WhatsApp */}
              <div
                style={{
                  marginTop: "var(--space-4)",
                  paddingTop: "var(--space-4)",
                  borderTop: "1px solid var(--border-default)",
                }}
              >
                <p className="label" style={{ marginBottom: "var(--space-2)" }}>
                  Share this Vehicle to Friends
                </p>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `🚗 Check out this ${vehicle.make} ${vehicle.model} (${vehicle.year}) for rent in ${vehicle.district}!\n\nRs. ${vehicle.daily_rate?.toLocaleString()}/day\n\n${SiteDomain}/explore/${vehicle.id}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-full"
                  style={{ textDecoration: "none", justifyContent: "center" }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.842L.057 23.571a.75.75 0 0 0 .921.921l5.733-1.452A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.355l-.355-.211-3.683.933.951-3.68-.23-.373A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                  </svg>
                  Share Link via WhatsApp
                </a>
              </div>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.72rem",
                  color: "var(--text-tertiary)",
                  marginTop: "var(--space-3)",
                }}
              >
                Calls and messages go directly to the Renter
              </p>
            </div>
          </div>
          {/* ← closes RIGHT — Info */}
        </div>
        {/* ← closes TOP GRID */}

        {/* ─── LOCATION ─── */}
        {vehicle.latitude && vehicle.longitude && (
          <div
            className="section-card"
            style={{ marginTop: "var(--space-10)", overflow: "hidden" }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)",
              }}
            >
              <p className="section-card-title" style={{ margin: 0 }}>
                🗺️ Approximate Location
              </p>
              <span className="badge badge-gray">📍 {vehicle.district}</span>
            </div>

            {/* Map preview — static Google Maps embed */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "220px",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                border: "1px solid var(--border-default)",
                marginBottom: "var(--space-4)",
                background: "var(--bg-subtle)",
              }}
            >
              <iframe
                src={`https://maps.google.com/maps?q=${vehicle.latitude},${vehicle.longitude}&z=14&output=embed`}
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vehicle location map"
              />

              {/* Overlay gradient at bottom */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60px",
                  background:
                    "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Info + CTA row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-3)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.83rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-display)",
                    marginBottom: "3px",
                  }}
                >
                  {vehicle.district}, Sri Lanka
                </p>
                <p
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  {vehicle.latitude.toFixed(4)}° N,{" "}
                  {vehicle.longitude.toFixed(4)}° E &nbsp;·&nbsp; Approximate
                  area shown
                </p>
              </div>

              <a
                href={`https://www.google.com/maps?q=${vehicle.latitude},${vehicle.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: "none", flexShrink: 0 }}
              >
                Open in Maps ↗
              </a>
            </div>
          </div>
        )}
      </main>

      {/* ─── STICKY CALL BAR (mobile only) ─── */}
      <div className="sticky-call-bar">
        <StickyCallBar
          phone={sellerPhone}
          sellerName={sellerName}
          vehicle={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
        />
      </div>

      <Footer />
    </div>
  );
}
