import { createClient } from "@/utils/supabase/server";
import FilterBar from "./components/FilterBar";
import VehicleCard from "./components/VehicleCard";
import Pagination from "./components/Pagination";
import { Suspense } from "react";
import Header from "@/components/Header";
import Link from "next/link";

import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Explore Vehicles",
  description:
    "Search and filter vehicles for rent across Sri Lanka. Find cars, vans, SUVs and more.",
};

const ITEMS_PER_PAGE = 12;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const type = params.type || "";
  const district = params.district || "";
  const withDriver = params.with_driver || "";
  const userLat = params.lat ? parseFloat(params.lat) : null;
  const userLng = params.lng ? parseFloat(params.lng) : null;

  let query = supabase
    .from("uploaded_rent_vehicles")
    .select("*", { count: "exact" });
  if (type) query = query.eq("type", type);
  if (district) query = query.eq("district", district);
  if (withDriver === "true") query = query.eq("with_driver", true);
  if (withDriver === "false") query = query.eq("with_driver", false);

  let vehicles: any[] = [];
  let totalPages = 1;
  let totalCount = 0;

  if (userLat !== null && userLng !== null) {
    const { data } = await query;
    const sorted = (data || [])
      .map((v) => ({
        ...v,
        distance: haversineDistance(userLat, userLng, v.latitude, v.longitude),
      }))
      .sort((a, b) => a.distance - b.distance);
    totalCount = sorted.length;
    totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    vehicles = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  } else {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    const { data, count } = await query
      .range(from, to)
      .order("bumped_until", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });
    vehicles = data || [];
    totalCount = count || 0;
    totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  }

  return (
    <div className="page">
      <Header />
      <div
        className="container"
        style={{ padding: "var(--space-8) var(--space-4)" }}
      >
        <Link
          href="/"
          className="btn btn-ghost btn-sm"
          style={{
            //position right top
            position: "absolute",
            // top: "var(--space-4)",
            right: "var(--space-10)",
            display: "inline-flex",
          }}
        >
          {"←"} Back
        </Link>

        {/* ─── Page Header ─── */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <p className="label" style={{ marginBottom: "var(--space-1)" }}>
            Sri Lanka
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
          >
            <h1 style={{ fontSize: "1.75rem" }}>Explore Vehicles</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
              {totalCount.toLocaleString()} vehicle{totalCount !== 1 ? "s" : ""}{" "}
              available
              {userLat && (
                <span
                  style={{
                    marginLeft: "var(--space-2)",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                  }}
                >
                  📍 Sorted by distance
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ─── Filter Bar ─── */}
        <Suspense
          fallback={
            <div
              className="skeleton"
              style={{
                height: "60px",
                borderRadius: "var(--radius-xl)",
                marginBottom: "var(--space-6)",
              }}
            />
          }
        >
          <FilterBar />
        </Suspense>

        {/* ─── Empty State ─── */}
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🚘</span>
            <p className="empty-state-title">No vehicles found</p>
            <p className="empty-state-sub">
              Try adjusting or clearing your filters
            </p>
          </div>
        ) : (
          // ─── Vehicle Grid ───
          <div
            className="stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}

        {/* ─── Pagination ─── */}
        <Suspense>
          <Pagination page={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
