import Link from "next/link";
import Image from "next/image";
import type { VehicleRow } from "@/utils/types";

export default function VehicleCard({
  vehicle: v,
  priority = false,
}: {
  vehicle: VehicleRow;
  /** Set on the first few cards so the largest visible image is not lazy-loaded. */
  priority?: boolean;
}) {
  const isBumped = v.bumped_until && new Date(v.bumped_until) > new Date();
  const title = `${v.make} ${v.model} ${v.year}`;

  return (
    <Link
      href={`/explore/${v.id}`}
      className={`vehicle-card animate-fade-in ${isBumped ? "bumped" : ""}`}
      // The whole card is one link, so give assistive tech the full label
      // rather than making it stitch together the child text.
      aria-label={`${title} for rent in ${v.district}, Rs. ${v.daily_rate?.toLocaleString()} per day`}
    >
      {/* Image */}
      <div className="vehicle-card-media">
        {v.image_urls?.[0] ? (
          <Image
            src={v.image_urls[0]}
            alt={`${title} for rent in ${v.district}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="vehicle-card-image"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="vehicle-card-placeholder" aria-hidden="true">
            🚗
          </div>
        )}

        {/* Type badge */}
        <span
          className="badge badge-dark"
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            backdropFilter: "blur(6px)",
          }}
        >
          {v.type}
        </span>

        {/* Only one badge on the right, so they can never overlap */}
        {isBumped ? (
          <span
            className="badge badge-red"
            style={{ position: "absolute", top: "8px", right: "8px" }}
          >
            🔥 Featured
          </span>
        ) : (
          v.with_driver && (
            <span
              className="badge"
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "var(--neutral-900)",
                color: "var(--neutral-0)",
                border: "none",
              }}
            >
              👨‍✈️ Driver
            </span>
          )
        )}
      </div>

      {/* Body */}
      <div className="vehicle-card-body">
        <div className="vehicle-card-title">{title}</div>

        <div className="vehicle-card-sub">
          📍 {v.district}
          {v.distance !== undefined && (
            <span
              style={{
                marginLeft: "var(--space-2)",
                color: "var(--color-primary)",
                fontWeight: 600,
              }}
            >
              • {v.distance.toFixed(1)} km away
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="vehicle-card-foot">
          <div className="vehicle-card-price">
            Rs. {v.daily_rate?.toLocaleString()}
            <span>/day</span>
          </div>
          <span className="badge badge-gray">
            {v.seat_count ? `${v.seat_count} seats` : v.fuel_type || "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
