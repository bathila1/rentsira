"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SearchModal({ onClose }: { onClose: () => void }) {
  
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      // Build URL params from AI response
      const params = new URLSearchParams();
      if (data.make) params.set("make", data.make);
      if (data.model) params.set("model", data.model);
      if (data.year) params.set("year", data.year);
      if (data.district) params.set("district", data.district);
      if (data.type) params.set("type", data.type);
      if (data.fuel_type) params.set("fuel_type", data.fuel_type);
      if (data.seat_count) params.set("seat_count", data.seat_count);

      onClose();
      router.push(`/explore?${params.toString()}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // const suggestions = [
  //   "Toyota Premio Kurunegala",
  //   "KDH van Colombo with driver",
  //   "SUV 2020 Kandy",
  //   "electric car Galle",
  //   "2018 Premio",
  //   "electric vehicles",
  //   "8 seater van",
  // ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgb(0 0 0 / 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "fade-in 0.15s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 201,
          width: "100%",
          maxWidth: "580px",
          padding: "0 var(--space-4)",
          // animation: 'slide-up 0.2s ease',
          // animation: 'fade-in 0.15s ease',
        }}
      >
        <div className="card" style={{ overflow: "hidden" }}>
          {/* Search input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            {/* Search icon */}
            <span
              style={{
                fontSize: "1rem",
                flexShrink: 0,
                color: "var(--text-tertiary)",
              }}
            >
              🔍
            </span>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Try: Premio Kurunegala..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                background: "transparent",
                fontFamily: "var(--font-body)",
              }}
            />

           

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="btn btn-primary btn-sm"
              style={{ flexShrink: 0 }}
            >
              {loading ? (
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    border: "2px solid rgb(255 255 255 / 0.3)",
                    borderTopColor: "white",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                background: "var(--color-error-light)",
                borderBottom: "1px solid var(--color-error-border)",
              }}
            >
              <p style={{ fontSize: "0.83rem", color: "var(--color-error)" }}>
                ❌ {error}
              </p>
            </div>
          )}

          {/* Suggestions */}
          {/* {!query && (
            <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <p className="label" style={{ marginBottom: 'var(--space-3)' }}>
                Try searching for
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); inputRef.current?.focus() }}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-full)',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )} */}

          {/* AI hint */}
          {/* <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderTop: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span style={{ fontSize: "0.75rem" }}>✨</span>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              AI-powered — Understands natural language
            </p>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.7rem",
                color: "var(--text-tertiary)",
              }}
            >
              Press anywhere to close
            </span>
          </div> */}
        </div>
      </div>
    </>
  );
}
