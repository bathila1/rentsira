"use client";

import { useState } from "react";
import SearchModal from "./SearchModal";

export default function SearchBarBig() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

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

      <div
        onClick={() => setShowSearch(true)}
        style={{ width: "100%", position: "relative" }}
      >
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
          style={{
            marginBottom: "var(--space-3)",
            cursor: "pointer",
            position: "relative",
            zIndex: 1,
            width: "100%",
            backgroundColor: "white",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            // border: "1px solid rgb(255 255 255 / 0.12)",
            borderRadius: "var(--radius-xl)",
            // padding: "var(--space-3)",
            boxShadow:
              "0 8px 40px rgb(0 0 0 / 0.3), inset 0 1px 0 rgb(255 255 255 / 0.08)",
          }}
        >
          {/* Vehicle Type */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
            }}
          >
            {/* Search icon */}
            <span
              style={{
                fontSize: "1.1rem",
                flexShrink: 0,
                color: "var(--text-tertiary)",
              }}
            >
              🔍
            </span>

            <input
              type="text"
              placeholder="Try: Toyota Premio Kurunegala..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                background: "transparent",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>
        </div>
      </div>
      {/* Search Modal */}
    </>
  );
}
