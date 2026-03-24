import Link from "next/link";

interface Vehicle {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  image_urls: string[];
  fuel_type: string;
  with_driver: boolean;
  daily_rate: number;
  district: string;
  bumped_until?: string;
  distance?: number;
}

export default function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const isBumped = v.bumped_until && new Date(v.bumped_until) > new Date();

  return (
    <Link
      href={`/explore/${v.id}`}
      className={`vehicle-card animate-fade-in ${isBumped ? "bumped" : ""}`}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          height: "180px",
          overflow: "hidden",
          background: "var(--bg-subtle)",
        }}
      >
        {v.image_urls?.[0] ? (
          <img
            src={v.image_urls[0]}
            alt={`${v.make} ${v.model}`}
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
            backdropFilter: "blur(6px)",
          }}
        >
          {v.type}
        </span>

        {/* Bumped badge */}
        {isBumped && (
          <span
            className="badge badge-red"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
            }}
          >
            🔥 Featured
          </span>
        )}

        {/* Driver badge — only if not bumped (avoid overlap) */}
        {v.with_driver && !isBumped && (
          <span
            className="badge"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "var(--neutral-900)",
              color: "var(--neutral-0)",
              border: "none",
            }}
          >
            👨‍✈️  With Driver
          </span>
        )}
      </div>

      {/* Body */}
      <div className="vehicle-card-body">
        <div
          style={{
            // right
            position: "absolute",
            // top: "10px",
            right: "5px",
          }}
        >
          <button style={{ cursor: "pointer"}} className="badge badge-red">👁️ View</button>
        </div>

        <div className="vehicle-card-title">
          {v.make} {v.model}{" "}
          <span
            style={{
              fontWeight: 400,
              color: "var(--text-tertiary)",
              fontSize: "0.83rem",
            }}
          >
            ({v.year})
          </span>
        </div>

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
              • 🗺️ {v.distance.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Price row */}
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
            Rs. {v.daily_rate?.toLocaleString()}
            <span>/day</span>
          </div>
          <span className="badge badge-gray">{v.fuel_type}</span>
        </div>
      </div>
    </Link>
  );
}
