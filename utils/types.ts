/**
 * Shape of a row from `uploaded_rent_vehicles` as selected for listing cards.
 *
 * The Supabase client returns untyped rows, so this is the one place that
 * describes what the listing pages actually rely on.
 */
export type VehicleRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  district: string;
  daily_rate: number;
  fuel_type: string;
  seat_count: number;
  with_driver: boolean;
  image_urls: string[];
  bumped_until?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** Added in-memory when results are sorted by distance. */
  distance?: number;
};

/** Narrow projection used to build facets (price range, available types). */
export type VehicleFacetRow = {
  type: string | null;
  daily_rate: number | null;
};
