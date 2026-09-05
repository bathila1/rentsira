import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SriLankanDistricts, dynamicData } from "@/settings";
import { absoluteUrl, slugify, unslugify } from "@/utils/seo";
import RentLanding, { loadLandingData } from "../../_components/RentLanding";

export const revalidate = 3600;

const VEHICLE_TYPES = dynamicData.vehicle_types;

/**
 * Deliberately not pre-rendering the full 25 x 10 grid. These render on first
 * request and are then cached; only the combinations that actually have
 * listings are advertised in the sitemap.
 */
export const dynamicParams = true;

type Props = { params: Promise<{ district: string; type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { district: dSlug, type: tSlug } = await params;
  const district = unslugify(dSlug, SriLankanDistricts);
  const type = unslugify(tSlug, VEHICLE_TYPES);

  if (!district || !type) return { title: "Not found" };

  const title = `${type} for Rent in ${district} — Daily & Monthly Hire Rates`;
  const description = `Rent a ${type.toLowerCase()} in ${district}, Sri Lanka. Compare daily rates from local owners, with or without a driver. Contact the owner directly — no booking fee.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/rent/${dSlug}/${tSlug}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/rent/${dSlug}/${tSlug}`),
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TypeLandingPage({ params }: Props) {
  const { district: dSlug, type: tSlug } = await params;

  const district = unslugify(dSlug, SriLankanDistricts);
  const type = unslugify(tSlug, VEHICLE_TYPES);
  if (!district || !type) notFound();

  const data = await loadLandingData(district, type);

  return (
    <RentLanding
      district={district}
      type={type}
      data={data}
      allDistricts={SriLankanDistricts}
    />
  );
}
