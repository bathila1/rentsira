"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The hero search box.
 *
 * This used to render a text input with no value, no handler and no form: the
 * whole bar was a click target that opened a separate modal, so anything a
 * visitor typed here was silently thrown away. It now searches for real, and
 * submits on Enter as well as on the button.
 */
export default function SearchBarBig() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      const params = new URLSearchParams();
      for (const key of [
        "make",
        "model",
        "year",
        "district",
        "type",
        "fuel_type",
        "seat_count",
        "with_driver",
      ]) {
        if (data[key]) params.set(key, String(data[key]));
      }

      // If the parser found nothing usable, fall back to a plain text match
      // rather than dropping the visitor on an unfiltered page.
      if ([...params.keys()].length === 0) params.set("make", q);

      router.push(`/explore?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not search. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hero-search" role="search">
      <label htmlFor="hero-search-input" className="sr-only">
        Search for a vehicle to rent
      </label>

      <div className="hero-search-bar">
        <span className="hero-search-icon" aria-hidden="true">
          🔍
        </span>

        <input
          id="hero-search-input"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError("");
          }}
          placeholder="Try: Toyota Premio in Kurunegala"
          className="hero-search-input"
          autoComplete="off"
          enterKeyHint="search"
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="hero-search-btn"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && (
        <p role="alert" className="hero-search-error">
          {error}
        </p>
      )}
    </form>
  );
}
