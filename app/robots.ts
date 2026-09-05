import { MetadataRoute } from "next";
import { absoluteUrl } from "@/utils/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private and non-indexable surfaces out of the crawl budget.
        // These pages either require a login or produce no useful search
        // result, and crawling them wastes the allowance for real listings.
        disallow: [
          "/admin",
          "/seller",
          "/api/",
          "/auth/",
          "/unauthorized",
          "/maintenance",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
