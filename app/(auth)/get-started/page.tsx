import { settingsData } from "@/settings";
import Link from "next/link";

export default function GetStartedPage() {
  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-scale text-center">
        {/* Eyebrow */}
        <div className="label mb-3">Start Renting</div>

        {/* Title */}
        <h1 className="display text-primary mb-3">
          Post Your <span className="text-red">Ad Free</span>
        </h1>
        <br />
        {/* Subtitle */}
        <p className="text-secondary mb-8">Do you already have an account?</p>

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-2">
          <Link
            href="/login"
            style={{ marginRight: "var(--space-4)" }}
            className="btn btn-primary btn-lg btn-full shadow-md"
          >
            Yes, Log In
          </Link>
          <Link
            href="/register"
            className="btn btn-secondary btn-lg btn-full shadow-sm"
          >
            No, Register
          </Link>
        </div>
        <br />

        {/* Divider */}
        <div className="divider-text my-6">Any Issue?</div>

        {/* Contact */}
        <Link href="/contact">
          <p className="text-tertiary text-sm">{settingsData.phone3}</p>
        </Link>

        <p
          style={{
            textAlign: "center",
            marginTop: "var(--space-5)",
            fontSize: "0.8rem",
          }}
        >
          <Link href="/" style={{ color: "var(--text-tertiary)" }}>
            {"←"} Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
