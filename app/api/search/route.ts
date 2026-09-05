import { dynamicData, SriLankanDistricts } from "@/settings";
import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/utils/seo";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DISTRICTS = SriLankanDistricts;
const VEHICLE_TYPES = dynamicData.vehicle_types;
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
/** Hard cap on tracked IPs, so the limiter cannot be used to exhaust memory. */
const MAX_TRACKED_IPS = 10_000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Drops entries whose window has already closed.
 *
 * Without this the map only ever grew: one permanent entry per unique IP that
 * ever hit the endpoint, which on a long-running server is a slow memory leak.
 */
function pruneRateLimits(now: number) {
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    // Prune opportunistically rather than on a timer, so this works on
    // serverless runtimes where background timers do not survive.
    if (rateLimitMap.size > MAX_TRACKED_IPS) pruneRateLimits(now);
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (limit.count >= MAX_REQUESTS) return true;

  limit.count++;
  return false;
}

/** Compares only the origin, so a trailing slash or a path cannot break it. */
function sameOrigin(value: string, expected: string): boolean {
  if (!value) return false;
  try {
    return new URL(value).origin === expected;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // ─── Rate limit ───
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // ─── CSRF: only accept calls made from our own pages ───
  // The old check used startsWith against NEXT_PUBLIC_SITE_URL, which is
  // configured with a trailing slash — so the Origin header ("https://renta.lk",
  // no slash) never matched and the check silently fell through to Referer.
  const expectedOrigin = new URL(SITE_URL).origin;
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";

  if (!sameOrigin(origin, expectedOrigin) && !sameOrigin(referer, expectedOrigin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!GROQ_API_KEY) {
    console.error("Search API: GROQ_API_KEY is not configured.");
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const query = body?.query;

    // Guard the type before touching .length/.replace — a JSON number or object
    // here used to throw and surface as a 500.
    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    if (query.length > 200) {
      return NextResponse.json(
        { error: "Search query too long." },
        { status: 400 },
      );
    }

    const cleanQuery = query.replace(/<[^>]*>/g, "").trim();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      // Never let a slow upstream hold a request open indefinitely.
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        max_tokens: 200,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a vehicle search parser for a Sri Lankan vehicle rental platform.
                        Extract search fields from the user query and return ONLY a valid JSON object.
                        No explanation, no markdown, no extra text — just raw JSON.

                        Available districts: ${DISTRICTS.join(", ")}
                        Available vehicle types: ${VEHICLE_TYPES.join(", ")}
                        Available fuel types: ${FUEL_TYPES.join(", ")}

                        Return this exact structure (omit fields not mentioned):
                        {
                        "make": "string or null",
                        "model": "string or null",
                        "year": "string or null",
                        "district": "must match one from the districts list or null",
                        "type": "must match one from vehicle types or null",
                        "fuel_type": "must match one from fuel types or null",
                        "seat_count": "number as string or null",
                        "with_driver": "true or false as string or null",
                        "description": "string or null"
                        }

                        Examples:
                        "toyota premio kurunegala" → {"make":"Toyota","model":"Premio","district":"Kurunegala"}
                        "benz 2020 colombo" → {"make":"Mercedes-Benz","year":"2020","district":"Colombo"}
                        "kdh van with driver" → {"make":"Toyota","model":"KDH","type":"Van","with_driver":"true"}
                        "electric car galle" → {"type":"Car","fuel_type":"Electric","district":"Galle"}
                        "8 seater van" → {"type":"Van","seat_count":"8"}
                        "beemer" → {"make":"BMW"}
                        "without driver suv kandy" → {"type":"SUV","district":"Kandy","with_driver":"false"},
                        "electric vehicles" → {"fuel_type":"Electric"}`,
          },
          { role: "user", content: cleanQuery },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Groq API failed");
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content);

    // Only pass through the fields the explore page understands, and only
    // values that match our own vocabulary. Without this whitelist the model's
    // output flows straight into database filters.
    const ALLOWED = [
      "make",
      "model",
      "year",
      "district",
      "type",
      "fuel_type",
      "seat_count",
      "with_driver",
      "description",
    ] as const;

    const result: Record<string, string> = {};

    for (const key of ALLOWED) {
      const val = parsed?.[key];
      if (!val || val === "null") continue;

      const str = String(val).slice(0, 60);

      // Constrained fields must match a known option exactly.
      if (key === "district") {
        const hit = DISTRICTS.find((d) => d.toLowerCase() === str.toLowerCase());
        if (hit) result.district = hit;
        continue;
      }
      if (key === "type") {
        const hit = VEHICLE_TYPES.find((t) => t.toLowerCase() === str.toLowerCase());
        if (hit) result.type = hit;
        continue;
      }
      if (key === "fuel_type") {
        const hit = FUEL_TYPES.find((f) => f.toLowerCase() === str.toLowerCase());
        if (hit) result.fuel_type = hit;
        continue;
      }
      if (key === "year" || key === "seat_count") {
        if (/^\d{1,4}$/.test(str)) result[key] = str;
        continue;
      }
      if (key === "with_driver") {
        if (str === "true" || str === "false") result.with_driver = str;
        continue;
      }

      result[key] = str;
    }

    return NextResponse.json(result);
  } catch (err: any) {
    // Logged server-side; the client gets a generic message so that upstream
    // error text is never reflected back to the browser.
    console.error("Search API error:", err?.message);
    return NextResponse.json(
      {
        error: 'Could not understand your search. Try: "Toyota Premio Colombo"',
      },
      { status: 500 },
    );
  }
}
