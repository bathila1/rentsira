import { settingsData } from "@/settings";

/**
 * Canonical origin for the site, with any trailing slash removed.
 *
 * The trailing slash matters: NEXT_PUBLIC_SITE_URL is configured as
 * "http://localhost:3000/", and the old code built URLs by plain concatenation
 * ( `${baseUrl}${route}` ), which produced "https://renta.lksitemap.xml" and
 * "https://renta.lkcontact". Normalising here means every caller can just use
 * absoluteUrl() and get a valid URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://renta.lk"
).replace(/\/+$/, "");

export const SITE_NAME = settingsData.WebName;

/** Builds an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : "/" + path;
  return SITE_URL + (clean === "/" ? "" : clean);
}

/** Turns "Nuwara Eliya" into "nuwara-eliya" for use in a URL. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Reverses slugify against a known list, so URLs cannot inject arbitrary text. */
export function unslugify<T extends string>(
  slug: string,
  allowed: readonly T[],
): T | null {
  const match = allowed.find((item) => slugify(item) === slug.toLowerCase());
  return match ?? null;
}

/**
 * Escapes a value before it goes into a PostgREST `ilike` pattern.
 *
 * Without this, a visitor searching for "50%" turns the % into a wildcard and
 * matches every row — and "_" matches any single character.
 */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => "\\" + c);
}

type JsonLd = Record<string, unknown>;

/** Site-level identity, emitted once from the root layout. */
export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo1.jpg"),
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: settingsData.SupportWhatsappNumber,
        contactType: "customer service",
        areaServed: "LK",
        availableLanguage: ["en", "si", "ta"],
      },
    ],
  };
}

/** Enables the sitelinks search box in Google results. */
export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/explore?make={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * A rentable vehicle. Uses Product + Offer because that is what Google's
 * rich-result parser understands for a priced, bookable item.
 */
export function vehicleJsonLd(vehicle: {
  id: string;
  make: string;
  model: string;
  year: number;
  district: string;
  daily_rate: number;
  fuel_type?: string | null;
  seat_count?: number | null;
  type?: string | null;
  description?: string | null;
  image_urls?: string[] | null;
}): JsonLd {
  const name = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${name} for Rent in ${vehicle.district}`,
    description:
      vehicle.description ||
      `Rent a ${name} in ${vehicle.district}, Sri Lanka from Rs. ${vehicle.daily_rate?.toLocaleString()} per day.`,
    image: vehicle.image_urls?.length ? vehicle.image_urls : undefined,
    brand: { "@type": "Brand", name: vehicle.make },
    category: vehicle.type || "Vehicle Rental",
    url: absoluteUrl(`/explore/${vehicle.id}`),
    additionalProperty: [
      vehicle.fuel_type && {
        "@type": "PropertyValue",
        name: "Fuel type",
        value: vehicle.fuel_type,
      },
      vehicle.seat_count && {
        "@type": "PropertyValue",
        name: "Seats",
        value: String(vehicle.seat_count),
      },
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      price: vehicle.daily_rate,
      priceCurrency: "LKR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/explore/${vehicle.id}`),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: vehicle.daily_rate,
        priceCurrency: "LKR",
        unitCode: "DAY",
      },
      areaServed: {
        "@type": "Place",
        name: `${vehicle.district}, Sri Lanka`,
      },
    },
  };
}

/** Search-results style listing, used on the city/type landing pages. */
export function itemListJsonLd(
  items: { id: string; make: string; model: string; year: number }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/explore/${v.id}`),
      name: `${v.make} ${v.model} ${v.year}`,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
