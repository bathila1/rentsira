import { settingsData } from "@/settings";
import Link from "next/link";
import { slugify } from "@/utils/seo";

/** Cities linked from the footer, so every page points at the landing pages. */
const FOOTER_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kandy",
  "Galle",
  "Kurunegala",
  "Kalutara",
  "Matara",
  "Jaffna",
];

const Footer = () => {
  return (
    <footer
      style={{
        background: "var(--neutral-950)",
        color: "var(--neutral-500)",
        borderTop: "1px solid var(--neutral-800)",
        marginTop: "var(--space-16)",
      }}
    >
      {/*
        This slot previously held a block of vehicle names rendered in
        `color: transparent` — text served to crawlers but hidden from people.
        That is hidden text under Google's spam policies and risks a manual
        action against the whole domain, so it has been replaced with the real,
        visible city links below, which target the same searches honestly.
      */}
      <div
        className="container"
        style={{ padding: "var(--space-10) var(--space-4)" }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "var(--space-8)",
            marginBottom: "var(--space-8)",
          }}
        >
          {/* Brand */}
          <div>
            <div
              className="nav-brand"
              style={{
                color: "var(--neutral-0)",
                marginBottom: "var(--space-2)",
                fontSize: "1.3rem",
              }}
            >
              {settingsData.LogoTextFirstPart}
              <span>{settingsData.LogoTextLastPart}</span>
            </div>
            <p
              style={{
                fontSize: "0.83rem",
                color: "var(--neutral-500)",
                maxWidth: "240px",
                lineHeight: 1.6,
              }}
            >
              Sri Lanka's premier vehicle rental platform. Car for Rent | Wedding Car Hire | Van for Rent | Renting Services
            </p>
            
          </div>

          {/* Links Grid */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-12)",
              flexWrap: "wrap",
            }}
          >
            {/* Platform Links */}
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--neutral-400)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Platform
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                <Link href="/explore" className="footer-link">
                  Browse Vehicles
                </Link>
                <Link href="/get-started" className="footer-link">
                  Add Your Vehicle
                </Link>
                <Link href="/contact" className="footer-link">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Popular cities — real internal links to the landing pages */}
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--neutral-400)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Rent by city
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                {FOOTER_DISTRICTS.map((d) => (
                  <Link
                    key={d}
                    href={`/rent/${slugify(d)}`}
                    className="footer-link"
                  >
                    Rent a car in {d}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal Links - REQUIRED FOR PAYHERE */}
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--neutral-400)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Legal
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                <Link href="/privacy-policy" className="footer-link">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="footer-link">
                  Terms & Conditions
                </Link>
                <Link href="/refund-policy" className="footer-link">
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid var(--neutral-800)",
            paddingTop: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-2)"
          }}
        >
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={settingsData.FooterTextLink}
            style={{ color: "var(--neutral-500)", textDecoration: "none" }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--neutral-600)",
                textAlign: "center",
              }}
            >
              {settingsData.FooterText}
            </p>
          </Link>
          <p style={{ fontSize: "0.7rem", color: "var(--neutral-700)" }}>
            © {new Date().getFullYear()} SIRAA | (Renta.lk). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;