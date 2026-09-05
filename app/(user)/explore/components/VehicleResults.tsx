import { createPublicClient } from "@/utils/supabase/public";
import VehicleCard from "./VehicleCard";
import Pagination from "./Pagination";
import RequestButton from "@/components/RequestButton";
import { escapeLike } from "@/utils/seo";
import type { VehicleRow } from "@/utils/types";
import { Suspense } from "react";

const ITEMS_PER_PAGE = 12;

/**
 * Only the columns the cards render. The old `select("*")` also pulled the
 * seller's identifiers and every internal field into a public page payload.
 */
const CARD_COLUMNS =
  "id, make, model, year, type, district, daily_rate, fuel_type, seat_count, with_driver, image_urls, bumped_until, latitude, longitude";

/** Upper bound for the distance-sorted branch — see the comment at its use. */
const GEO_SCAN_LIMIT = 500;

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

/** Parses a positive integer from a query string, or null if it is not one. */
function toPositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Parses a latitude/longitude pair, rejecting anything out of range. */
function toCoord(value: string | undefined, max: number): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
}

export type ExploreParams = { [key: string]: string | undefined };

/**
 * The results half of the explore page.
 *
 * Split out of the page so it can sit behind its own Suspense boundary: the
 * header, heading and filter bar paint immediately while this waits on the
 * database, instead of the whole route hiding behind a full-page loader.
 */
export default async function VehicleResults({
  params,
}: {
  params: ExploreParams;
}) {
  const supabase = createPublicClient();

  // `parseInt("abc")` is NaN and `page=0` produced `.range(-12, -1)`, both of
  // which make Postgres error out. Clamp to a sane page number instead.
  const page = toPositiveInt(params.page) ?? 1;

  const type = params.type || "";
  const district = params.district || "";
  const withDriver = params.with_driver || "";
  const userLat = toCoord(params.lat, 90);
  const userLng = toCoord(params.lng, 180);

  const make = params.make || "";
  const model = params.model || "";
  const year = toPositiveInt(params.year);
  const fuelType = params.fuel_type || "";
  const description = params.description || "";
  const seatCount = toPositiveInt(params.seat_count);

  let query = supabase
    .from("uploaded_rent_vehicles")
    .select(CARD_COLUMNS, { count: "exact" });

  // ilike (with no wildcards) is a case-insensitive exact match. Using eq here
  // would silently drop listings whose stored casing differs from the dropdown.
  if (type) query = query.ilike("type", escapeLike(type));
  if (district) query = query.ilike("district", escapeLike(district));
  if (withDriver === "true") query = query.eq("with_driver", true);
  if (withDriver === "false") query = query.eq("with_driver", false);

  // escapeLike stops a visitor's "%" or "_" being treated as a wildcard, which
  // would otherwise silently match every row in the table.
  if (make) query = query.ilike("make", `%${escapeLike(make)}%`);
  if (model) query = query.ilike("model", `%${escapeLike(model)}%`);
  if (year) query = query.eq("year", year);
  if (fuelType) query = query.ilike("fuel_type", escapeLike(fuelType));
  if (seatCount) query = query.eq("seat_count", seatCount);
  if (description)
    query = query.ilike("description", `%${escapeLike(description)}%`);

  let vehicles: VehicleRow[] = [];
  let totalPages = 1;
  let totalCount = 0;

  if (userLat !== null && userLng !== null) {
    // Distance sorting has to happen in the application because the ordering
    // key is computed per request. Capping the scan keeps a "near me" search
    // from pulling the entire table into memory as the site grows; 500 is far
    // more than anyone pages through, and the nearest results still surface.
    const { data } = await query.limit(GEO_SCAN_LIMIT);

    const sorted = ((data ?? []) as unknown as VehicleRow[])
      // A listing with no coordinates cannot be ranked by distance — including
      // it produced a NaN distance that corrupted the whole sort order.
      .filter(
        (v) => typeof v.latitude === "number" && typeof v.longitude === "number",
      )
      .map((v) => ({
        ...v,
        distance: haversineDistance(
          userLat,
          userLng,
          v.latitude as number,
          v.longitude as number,
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    totalCount = sorted.length;
    totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
    vehicles = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  } else {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    const { data, count } = await query
      .order("bumped_until", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    vehicles = (data ?? []) as unknown as VehicleRow[];
    totalCount = count ?? 0;
    totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  }

  return (
    <>
      <p className="explore-count">
        <strong>{totalCount.toLocaleString()}</strong> vehicle
        {totalCount !== 1 ? "s" : ""} available
        {userLat !== null && (
          <span
            style={{
              marginLeft: "var(--space-2)",
              color: "var(--color-primary)",
              fontWeight: 600,
            }}
          >
            📍 sorted by distance
          </span>
        )}
      </p>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🚘</span>
          <p className="empty-state-sub">
            No vehicles match this search. Send us a request and we will find a
            match for you.
          </p>
          <RequestButton />
        </div>
      ) : (
        <div className="vehicle-grid">
          {vehicles.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} priority={i < 4} />
          ))}
        </div>
      )}

      <Suspense>
        <Pagination page={page} totalPages={totalPages} />
      </Suspense>
    </>
  );
}

/** Placeholder shown while the results load. */
export function VehicleResultsSkeleton() {
  return (
    <div className="vehicle-grid" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: "260px", borderRadius: "var(--radius-xl)" }}
        />
      ))}
    </div>
  );
}
