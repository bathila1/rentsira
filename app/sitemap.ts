import { MetadataRoute } from "next";
import { createPublicClient } from "@/utils/supabase/public";
import { absoluteUrl, slugify } from "@/utils/seo";

// Regenerate at most once an hour rather than on every crawler hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ─── 1. Static routes ───
  // Note these are weighted by search value, not by how much we like them:
  // /explore and the landing pages are what people actually search for, while
  // /login and /register have no organic value at all and are left out.
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/explore", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/book", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" as const },
    { path: "/get-started", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/refund-policy", priority: 0.2, changeFrequency: "yearly" as const },
  ].map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // ─── 2. One query powers both the vehicle URLs and the landing pages ───
  const supabase = createPublicClient();
  const { data: vehicles, error } = await supabase
    .from("uploaded_rent_vehicles")
    .select("id, created_at, type, district")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error || !vehicles) {
    console.error("Sitemap fetch error:", error);
    return staticRoutes;
  }

  // ─── 3. Vehicle detail pages ───
  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: absoluteUrl(`/explore/${v.id}`),
    lastModified: v.created_at ? new Date(v.created_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ─── 4. Location landing pages ───
  // Only combinations that actually have a listing are published. Emitting the
  // full 25 x 10 cross product would create hundreds of empty pages, which
  // Google treats as thin/doorway content and can penalise the whole domain.
  const districts = new Set<string>();
  const combos = new Set<string>();

  for (const v of vehicles) {
    if (!v.district) continue;
    districts.add(v.district);
    if (v.type) combos.add(`${v.district}|${v.type}`);
  }

  const districtRoutes: MetadataRoute.Sitemap = [...districts].map((d) => ({
    url: absoluteUrl(`/rent/${slugify(d)}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const comboRoutes: MetadataRoute.Sitemap = [...combos].map((key) => {
    const [district, type] = key.split("|");
    return {
      url: absoluteUrl(`/rent/${slugify(district)}/${slugify(type)}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    };
  });

  return [...staticRoutes, ...districtRoutes, ...comboRoutes, ...vehicleRoutes];
}
