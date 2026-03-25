import { MetadataRoute } from 'next';
import { supabase } from '@/utils/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/contact",
    "/seller/dashboard",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // 2. Fetch Vehicle Data
  // We fetch 'id' and 'created_at' (common Supabase default)
  const { data: vehicles, error } = await supabase
    .from("uploaded_rent_vehicles")
    .select("id, created_at");

  if (error || !vehicles) {
    console.error("Sitemap fetch error:", error);
    return staticRoutes;
  }

  // 3. Dynamic Vehicle Routes
  const vehicleRoutes = vehicles.map((vehicle) => ({
    url: `${baseUrl}/explore/${vehicle.id}`,
    // Fallback to current date if created_at is missing
    lastModified: vehicle.created_at ? new Date(vehicle.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}