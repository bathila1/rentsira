"use client";

import { dynamicData, SriLankanDistricts } from "@/settings";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VEHICLE_TYPES = dynamicData.vehicle_types;

const DISTRICTS = SriLankanDistricts;

const dropdownStyle: React.CSSProperties = {
  width: "100%",
  background: "rgb(255 255 255 / 0.97)",
  border: "1.5px solid rgb(255 255 255 / 0.3)",
  borderRadius: "var(--radius-lg)",
  padding: "0.75rem 2.2rem 0.75rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--neutral-800)",
  fontFamily: "var(--font-body)",
  cursor: "pointer",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center",
  backgroundSize: "1rem",
  boxShadow:
    "0 1px 3px rgb(0 0 0 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.9)",
  transition: "all 0.15s ease",
};

export default function Search() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [district, setDistrict] = useState("");
  const [driver, setDriver] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (district) params.set("district", district);
    if (driver) params.set("with_driver", driver);
    return params;
  };

  const handleSearch = () => {
    router.push(`/explore?${buildParams().toString()}`);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = buildParams();
        params.set("lat", pos.coords.latitude.toFixed(6));
        params.set("lng", pos.coords.longitude.toFixed(6));
        router.push(`/explore?${params.toString()}`);
        setGpsLoading(false);
      },
      () => {
        alert("Could not get location. Please allow location access.");
        setGpsLoading(false);
      },
    );
  };

  return (
    <>
      {/* Responsive styles injected once */}
      <style>{`
        .search-bar-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .search-bar-driver {
          grid-column: 1 / -1;
        }
        .search-bar-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
        }
        .search-btn-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--color-primary);
          border: none;
          color: white;
          border-radius: var(--radius-lg);
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: var(--font-display);
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 16px rgb(248 50 50 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.15);
        }
        .search-btn-main:hover {
          background: var(--color-primary-hover);
          box-shadow: 0 6px 20px rgb(248 50 50 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.15);
          transform: translateY(-1px);
        }
        .search-btn-gps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgb(255 255 255 / 0.07);
          border: 1px solid rgb(255 255 255 / 0.15);
          color: rgb(255 255 255 / 0.8);
          border-radius: var(--radius-lg);
          padding: 0.85rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .search-gps-label { display: inline; }

        /* ── Desktop: single row ── */
        @media (min-width: 768px) {
          .search-bar-grid {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            gap: 10px;
          }
          .search-bar-driver  { grid-column: unset; flex: 1; min-width: 140px; }
          .search-bar-actions { grid-column: unset; flex: 0 0 auto; }
          .search-bar-type    { flex: 1; min-width: 140px; }
          .search-bar-district { flex: 1; min-width: 140px; }
          .search-btn-main    { padding: 0.75rem 1.6rem; flex: 0 0 auto; }
          .search-btn-gps     { padding: 0.75rem 1.1rem; }
          .search-gps-label   { display: inline; }
        }

        /* ── Mobile: tighten up ── */
        @media (max-width: 767px) {
          .search-bar-district { grid-column: 2; }
          .search-bar-type     { grid-column: 1; }
         /* .search-gps-label    { display: none; } */
          .search-btn-gps      { padding: 0.85rem 1rem; flex-shrink: 0; }
        }
      `}</style>

      <div style={{ width: "100%", position: "relative" }}>
        {/* Glow ring */}
        <div
          style={{
            position: "absolute",
            inset: "-2px",
            borderRadius: "calc(var(--radius-xl) + 2px)",
            background:
              "linear-gradient(135deg, rgb(248 50 50 / 0.35), rgb(255 255 255 / 0.05), rgb(248 50 50 / 0.2))",
            filter: "blur(8px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Bar */}
        <div
          className="search-bar-grid"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            background: "rgb(15 15 20 / 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgb(255 255 255 / 0.12)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-3)",
            boxShadow:
              "0 8px 40px rgb(0 0 0 / 0.3), inset 0 1px 0 rgb(255 255 255 / 0.08)",
          }}
        >
          {/* Vehicle Type */}
          <div className="search-bar-type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={dropdownStyle}
            >
              <option value="">🚗 Type</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="search-bar-district">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={dropdownStyle}
            >
              <option value="">📍 District</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Driver — full width on mobile */}
          <div className="search-bar-driver">
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              style={dropdownStyle}
            >
              <option value="">👤 Driver? </option>
              <option value="true">👨‍✈️ With Driver</option>
              <option value="false">🔑 Without Driver</option>
            </select>
          </div>

          {/* Actions row — full width on mobile */}
          <div className="search-bar-actions">
            {/* Search */}
            <button onClick={handleSearch} className="search-btn-main">
              🔍 Search
            </button>

            {/* Near Me */}
            <button
              onClick={handleNearMe}
              disabled={gpsLoading}
              className="search-btn-gps"
              style={{
                opacity: gpsLoading ? 0.5 : 1,
                cursor: gpsLoading ? "not-allowed" : "pointer",
              }}
            >
              {gpsLoading ? "⏳" : "📍"}
              <span className="search-gps-label">
                {gpsLoading ? "Locating..." : "Near Me"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
