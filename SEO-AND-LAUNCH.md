# Renta.lk — Launch checklist & SEO guide

Two parts: **things you must do before pushing** (blocking), and **things to do
after launch to actually rank**.

---

## PART 1 — Do these before you push

### 1. `NEXT_PUBLIC_SITE_URL` is still localhost — this is the big one

`.env.local` currently has:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000/
```

Every canonical tag, every Open Graph URL, the sitemap, robots.txt and the
Google login redirect are built from this value. Ship as-is and Google will be
told your canonical homepage is `http://localhost:3000` — the site will not rank
at all, and Google sign-in will break.

Set this in your **hosting provider's** environment variables (Vercel →
Settings → Environment Variables), not just locally:

```
NEXT_PUBLIC_SITE_URL=https://renta.lk
```

No trailing slash needed — the code strips it either way now.

### 2. Move the admin email off the client bundle

`NEXT_PUBLIC_ADMIN_EMAIL` is inlined into the JavaScript every visitor
downloads, so anyone can read your admin address in devtools. Add a server-only
variable:

```
ADMIN_EMAIL=your-real-admin@address
```

The code prefers `ADMIN_EMAIL` and falls back to the old one, so nothing breaks
while you switch. Once it is set, delete `NEXT_PUBLIC_ADMIN_EMAIL`.

### 3. Run the site_settings migration

The admin payment toggle needs its table. In the Supabase dashboard → SQL
Editor, run:

```
supabase/migrations/20260906_site_settings.sql
```

Also **edit the admin email inside that file** before running it — the write
policy has `admin@renta.lk` hard-coded and it must match your real admin
address.

Until you run it, the site still works: it falls back to payments disabled,
which is what you want right now anyway.

### 4. Check your Supabase Row Level Security

This is the one thing I could not verify from the code, and it is the most
important security control you have. The browser holds your anon key, so
**anyone can query your tables directly** — RLS is the only thing stopping them.
In the Supabase dashboard, confirm for each table:

| Table | Should allow |
|---|---|
| `uploaded_rent_vehicles` | public SELECT; INSERT/UPDATE/DELETE only where `seller_id = auth.uid()` |
| `profiles` | public SELECT of name/phone only; UPDATE only own row |
| `booking_requests` | INSERT by anyone; SELECT only by admin |
| `contact_messages` | INSERT by anyone; SELECT only by admin |
| `bump_history` | SELECT own rows only |

Test it: open a private window (logged out) and run a query against
`booking_requests` from the browser console. If it returns other people's phone
numbers, fix the policy before launch.

### 5. Delete the stray Google client secret file

`client_secret_934417823388-....json` is sitting in the project root. It is
gitignored, so it never reached GitHub — but do not let it drift into a Docker
image or a zip. Move it out of the project folder.

---

## PART 2 — SEO

### What is already done in the code

- **Titles rewritten around search intent, not the brand.** The old template
  appended `| SIRAA` to everything. Nobody searches "SIRAA", so those characters
  were wasted. Titles now read like the query itself:
  - Home → *Rent a Car in Sri Lanka — Cars, Vans & SUVs With or Without Driver*
  - City → *Rent a Car in Kandy — Cars, Vans & SUVs for Hire*
  - City + type → *Van for Rent in Kandy — Daily & Monthly Hire Rates*
  - Listing → *Toyota Premio 2018 for Rent in Kandy — Rs. 8,500/day*
- **New landing pages** at `/rent/[district]` and `/rent/[district]/[type]`.
  These are what rank for "rent a car in colombo" — your old site had no page
  targeting that phrase at all. All 25 districts are prerendered.
- **Structured data** (JSON-LD): Organization, WebSite with search box,
  Breadcrumbs, FAQ, ItemList, and Product+Offer with the price on every listing.
  The price is what produces the rich result in Google.
- **Sitemap fixed.** It was generating `https://renta.lksitemap.xml` and
  `https://renta.lkcontact` — malformed URLs, from string concatenation without
  a slash. Now 221 valid URLs including every landing page.
- **Hidden keyword text removed from the footer.** There was a block of vehicle
  names rendered in `color: transparent` — text shown to Google but not to
  people. That is hidden text under Google's spam policies and risks a manual
  penalty on the whole domain. It is now real, visible city links.
- **The 400-entry `keywords` meta tag is gone.** Google has ignored meta
  keywords since 2009. It was duplicated in two files and shipped on every
  single response.
- **Filtered `/explore` URLs are now `noindex, follow`** so hundreds of
  near-identical filter combinations don't compete with your landing pages.
- **Real 404s.** Invalid URLs returned HTTP 200 with 404 content ("soft 404"),
  which lets junk URLs into the index. They now return a proper 404.

### What you have to do yourself — in priority order

**1. Google Search Console (do this on day one)**
   - Add and verify `renta.lk` at <https://search.google.com/search-console>.
   - Submit `https://renta.lk/sitemap.xml`.
   - Use "URL Inspection → Request Indexing" on your homepage and 3–4 city
     pages to get the first crawl moving.
   - Check the Coverage report weekly for the first month.

**2. Google Business Profile**
   For local searches ("rent a car near me"), a Business Profile often outranks
   the website itself. Create one at <https://business.google.com>, choose the
   Car Rental Agency category, add real photos, and get your first reviews.
   This is usually the single highest-return action for a local Sri Lankan
   service business.

**3. Get listings in — content is the ranking material**
   A city page with 20 vehicles will beat one with 2, every time. The landing
   pages only publish to the sitemap when they actually have listings, so
   filling Colombo, Gampaha, Kandy and Galle first gives you four strong pages
   rather than 25 weak ones.

**4. Backlinks**
   Sri Lankan directories, tourism blogs, Facebook groups for vehicle owners,
   and any hotel or wedding-service site you partner with. A handful of
   genuinely relevant local links matters more than volume.

**5. Write a few real articles**
   These target the informational searches that lead into rentals:
   - "How much does it cost to rent a car in Sri Lanka?" (with a real price
     table — this gets shared and linked)
   - "Documents you need to rent a car in Sri Lanka as a foreigner"
   - "Self-drive vs with a driver in Sri Lanka: which should you choose?"
   Put them at `/guides/[slug]` and link them from the footer.

**6. Ask sellers for better photos**
   The first photo is the Open Graph image on WhatsApp shares, and WhatsApp is
   how things spread in Sri Lanka. A bright, clean photo of the whole car raises
   click-through more than most on-page SEO work.

### What NOT to do

- Don't put the keyword list back. It does nothing and slows every page.
- Don't add hidden text, white-on-white text, or stuffed footers again — that
  is what risks a penalty, and the site was carrying one.
- Don't create landing pages for districts with no vehicles. Empty pages are
  "thin content" and drag the whole domain down. The code already prevents this.

### Realistic timeline

Google needs to crawl, index, then build trust. Expect roughly:

- **Week 1–2:** pages get indexed, brand searches ("renta.lk") find you.
- **Month 1–3:** long-tail traffic appears ("toyota premio for rent kurunegala").
- **Month 3–6+:** competitive terms ("rent a car sri lanka") start to move — and
  only with backlinks and real listing volume behind them.

---

## Payment gateway toggle

PayHere is **off**, controlled from `/admin/settings`:

- **Payments off** (current): no payment UI anywhere. Anything that would cost
  money shows a WhatsApp button to `+94 76 479 0033` instead.
- **Free listing bumps**: on, so sellers can still bump at no charge.
- **PayHere mode**: Sandbox / Live. Live is blocked unless payments are enabled,
  so you cannot half-enable a real checkout by accident.

If the settings read ever fails, the code falls back to **payments disabled** —
it fails safe rather than showing a checkout that cannot take money.

Note: your legal pages (Terms, Privacy, Refund Policy) already tell customers
that payments are processed by PayHere. That is fine while nothing is being
charged, but keep it in mind if you stay unpaid for long.
