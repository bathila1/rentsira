import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SriLankanDistricts } from "@/settings";
import { absoluteUrl, slugify, unslugify } from "@/utils/seo";
import RentLanding, { loadLandingData } from "../_components/RentLanding";

// Listings change through the day, but not by the second. Rebuilding hourly
// keeps these pages served from cache instead of hitting the database per view.
export const revalidate = 3600;

/**
 * Every valid district is known ahead of time, so refuse anything else.
 *
 * With dynamicParams left on, an unknown slug rendered through the streaming
 * shell and returned HTTP 200 with 404 content — a "soft 404", which lets
 * arbitrary URLs into the index. Closing the set makes Next return a real 404.
 */
export const dynamicParams = false;

/** Pre-render every district at build time so crawlers always get a fast page. */
export function generateStaticParams() {
  return SriLankanDistricts.map((d) => ({ district: slugify(d) }));
}

type Props = { params: Promise<{ district: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district: slug } = await params;
  const district = unslugify(slug, SriLankanDistricts);

  if (!district) return { title: "Not found" };

  // Written as the query itself: "rent a car in kandy" rather than a brand line.
  const title = `Rent a Car in ${district} — Cars, Vans & SUVs for Hire`;
  const description = `Rent a car, van or SUV in ${district}, Sri Lanka. Compare daily rates from local owners, with or without a driver. Contact the owner directly — no booking fee.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/rent/${slug}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/rent/${slug}`),
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DistrictLandingPage({ params }: Props) {
  const { district: slug } = await params;

  // Only known districts resolve. An unrecognised slug 404s rather than
  // rendering an empty page that Google would index as thin content.
  const district = unslugify(slug, SriLankanDistricts);
  if (!district) notFound();

  const data = await loadLandingData(district);

  return (
    <RentLanding
      district={district}
      data={data}
      allDistricts={SriLankanDistricts}
    />
  );
}
