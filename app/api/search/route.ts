import { dynamicData, SriLankanDistricts } from "@/settings";
import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DISTRICTS = SriLankanDistricts;
const VEHICLE_TYPES = dynamicData.vehicle_types;
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];

// ─── Simple in-memory rate limiter ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  // Reset if window expired
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 min window
    return false;
  }

  // Allow max 10 searches per minute per IP
  if (limit.count >= 10) return true;

  limit.count++;
  return false;
}

export async function POST(req: NextRequest) {
  // ─── Rate limit check ───
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a moment." },
      { status: 429 },
    );
  }

  // ─── CSRF: only allow requests from your own domain ───
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";

  const allowedDomain =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const isAllowed =
    origin.startsWith(allowedDomain) || referer.startsWith(allowedDomain);

  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /////

  try {
    const { query } = await req.json();
    if (!query)
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    if (query.length > 200) {
      return NextResponse.json(
        { error: "Search query too long." },
        { status: 400 },
      );
    }

    // ─── Basic sanitize — strip HTML tags ───
    const cleanQuery = query.replace(/<[^>]*>/g, "").trim();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        max_tokens: 200,
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
          {
            role: "user",
            content: cleanQuery,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Groq API failed");
    }

    const data = await res.json();
    // console.log(data.choices?.[0]?.message?.content.trim());

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) throw new Error("Empty response from AI");

    // ─── Parse JSON safely ───
    const parsed = JSON.parse(content);
    // console.log("parsed : ", parsed);

    // ─── Clean nulls ───
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (val && val !== "null") result[key] = String(val);
    }

    console.log("result : ", result);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Search API error:", err.message);
    return NextResponse.json(
      {
        error: 'Could not understand your search. Try: "Toyota Premio Colombo"',
      },
      { status: 500 },
    );
  }
}
