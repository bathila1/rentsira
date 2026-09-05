import { Suspense } from "react";
import type { Metadata } from "next";

import FilterBar from "./components/FilterBar";
import VehicleResults, {
  VehicleResultsSkeleton,
  type ExploreParams,
} from "./components/VehicleResults";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { absoluteUrl } from "@/utils/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ExploreParams>;
}): Promise<Metadata> {
  const params = await searchParams;

  const parts: string[] = [];
  if (params.make) parts.push(params.make);
  if (params.model) parts.push(params.model);
  if (params.type) parts.push(params.type);
  if (params.year) parts.push(params.year);
  if (params.fuel_type) parts.push(params.fuel_type);
  if (params.seat_count) parts.push(`${params.seat_count} seater`);

  const where = params.district ? ` in ${params.district}` : " in Sri Lanka";
  const subject = parts.length > 0 ? parts.join(" ") : "Vehicles";

  const title = `${subject} for Rent${where} — Compare Daily Rates`;
  const description =
    parts.length > 0
      ? `Find ${subject.toLowerCase()} for rent${where}. Compare daily rates from local owners, with or without a driver. No booking fee.`
      : `Browse vehicles for rent across all 25 districts of Sri Lanka. Cars, vans, SUVs and buses from local owners, with or without a driver.`;

  // Filtered result pages are near-duplicates of each other and of the /rent
  // landing pages. Letting Google index every filter combination splits ranking
  // signals across hundreds of thin URLs, so only the unfiltered page is
  // indexable — links are still followed so listings get discovered.
  const hasFilters = Object.keys(params).some((k) => k !== "page" && params[k]);

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/explore") },
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreParams>;
}) {
  const params = await searchParams;

  // Changing any filter must remount the results boundary, otherwise the
  // previous query's cards stay on screen while the new one runs.
  const resultsKey = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][],
  ).toString();

  return (
    <div className="page">
      <Header />

      <main
        className="container"
        style={{ padding: "var(--space-4) var(--space-4) var(--space-10)" }}
      >
        <h1 className="explore-title">
          {params.district
            ? `Vehicles for rent in ${params.district}`
            : "Vehicles for rent"}
        </h1>

        {/* Filters render immediately, on every screen size. They used to sit
            inside a `hiddenFromMobile` wrapper, which left phone users — most
            of this audience — with no way to narrow the list at all. */}
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

        {/* Only the results wait on the database, so the page frame and the
            filters are usable while the query runs. */}
        <Suspense key={resultsKey} fallback={<VehicleResultsSkeleton />}>
          <VehicleResults params={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
