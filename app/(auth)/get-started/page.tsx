// import { settingsData } from "@/settings";
// import Link from "next/link";

// export default function GetStartedPage() {
//   return (
//     <div className="auth-page">
//       {/* Logo */}
//       <div className="auth-card animate-fade-in-scale text-center">
//         {/* Eyebrow */}
//         <div className="label mb-3">Start Renting</div>

//         {/* Title */}
//         <h1 className="display text-primary mb-3">
//           Post Your <span className="text-red">Ad Free</span>
//         </h1>
//         <br />
//         {/* Subtitle */}
//         <p className="text-secondary mb-8">Do you already have an account?</p>

//         {/* Actions */}
//         <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-2">
//           <Link
//             href="/login"
//             style={{ marginRight: "var(--space-4)" }}
//             className="btn btn-primary btn-lg btn-full shadow-md"
//           >
//             Yes, Log In
//           </Link>
//           <Link
//             href="/register"
//             className="btn btn-secondary btn-lg btn-full shadow-sm"
//           >
//             No, Register
//           </Link>
//         </div>
//         <br />

//         {/* Divider */}
//         <div className="divider-text my-6">Any Issue?</div>

//         {/* Contact */}
//         <Link href="/contact">
//           <p className="text-tertiary text-sm">{settingsData.phone3}</p>
//         </Link>

//         <p
//           style={{
//             textAlign: "center",
//             marginTop: "var(--space-5)",
//             fontSize: "0.8rem",
//           }}
//         >
//           <Link href="/" style={{ color: "var(--text-tertiary)" }}>
//             {"←"} Back to Home
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { settingsData } from "@/settings";
import BackButton from "@/app/(user)/explore/[id]/components/BackBtn";

export const metadata: Metadata = {
  title: "Get Started",
  description: "List your vehicle for rent on SIRAA — free.",
};

export default function GetStartedPage() {
  return (
    <div className="page">
      <div
        style={{
          minHeight: "calc(100vh - var(--nav-height))",
          display: "grid",
          placeItems: "center",
          padding: "var(--space-6)",
          background: "var(--bg-page)",
        }}
      >
        <div style={{ maxWidth: "480px", width: "100%" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
            <div
              className="auth-logo"
              style={{ marginBottom: "var(--space-4)" }}
            >
              {settingsData.LogoTextFirstPart}
              <span>{settingsData.LogoTextLastPart}</span>
            </div>
            <h1 style={{ fontSize: "1.2rem", marginBottom: "var(--space-2)" }}>
              Add a Vehicle for Renting
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-tertiary)" }}>
              Reach thousands of renters across Sri Lanka — completely free
            </p>
          </div>

          {/* ─── Two Cards ─── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {/* New user */}
            <Link href="/register" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--neutral-950)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  cursor: "pointer",
                  transition: "var(--transition-fast)",
                  border: "1px solid var(--neutral-800)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--neutral-0)",
                      marginBottom: "4px",
                    }}
                  >
                    🚀 New here?
                  </p>
                  <p
                    style={{ fontSize: "0.8rem", color: "var(--neutral-400)" }}
                  >
                    Create a free account
                  </p>
                </div>
                <div className="btn btn-primary" style={{ flexShrink: 0 }}>
                  Register
                </div>
              </div>
            </Link>

            {/* Existing user */}
            <Link href="/login" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  cursor: "pointer",
                  transition: "var(--transition-fast)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    👋 Already have an account?
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Sign in to manage your Rentings
                  </p>
                </div>
                <div className="btn btn-secondary" style={{ flexShrink: 0 }}>
                  Sign In
                </div>
              </div>
            </Link>
          </div>

          {/* Benefits */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
              marginTop: "var(--space-8)",
            }}
          >
            {[
              {
                icon: "🚗",
                text: "Add any vehicle — cars, vans, SUVs and more",
              },
              // { icon: '📍', text: 'Reach renters in all 25 districts' },
              // { icon: '📞', text: 'Renters contact you directly' },
              { icon: "🆓", text: "Registration Free" },
            ].map((item) => (
              <div
                key={item.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-lg)",
                  // border: '1px solid var(--border-default)',
                }}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Back */}
          <p
            style={{
              textAlign: "center",
              marginTop: "var(--space-6)",
              fontSize: "0.8rem",
            }}
          >
            <BackButton/>
          </p>
        </div>
      </div>
    </div>
  );
}
