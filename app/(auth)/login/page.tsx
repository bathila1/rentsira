"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { settingsData } from "@/settings";

// ─── Google SVG icon ───
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Email login ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else router.push("/seller/dashboard");
  };

  // ─── Google login ───
  const handleGoogle = async () => {
    setGLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGLoading(false);
    }
    // No else needed — browser redirects automatically
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in-scale">
        {/* Logo */}
        <div className="auth-logo">
          {settingsData.LogoTextFirstPart}
          <span>{settingsData.LogoTextLastPart}</span>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h1 style={{ fontSize: "1.4rem", marginBottom: "var(--space-1)" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
            Sign in to manage your listings
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-error"
            style={{ marginBottom: "var(--space-5)" }}
          >
            ❌ {error}
          </div>
        )}

        {/* ─── Google Button ─── */}
        <button
          onClick={handleGoogle}
          disabled={gLoading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
            padding: "0.75rem",
            border: "1.5px solid var(--border-default)",
            borderRadius: "var(--radius-xl)",
            background: "var(--bg-card)",
            cursor: gLoading ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            transition: "var(--transition-fast)",
            marginBottom: "var(--space-5)",
            opacity: gLoading ? 0.6 : 1,
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-strong)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-default)")
          }
        >
          {gLoading ? (
            <>
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid var(--border-default)",
                  borderTopColor: "var(--color-primary)",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Connecting to Google...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div
          className="divider-text"
          style={{ marginBottom: "var(--space-5)" }}
        >
          or sign in with email
        </div>

        {/* Email form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: "var(--space-2)" }}
          >
            {loading ? "⏳ Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="divider-text" style={{ margin: "var(--space-6) 0" }}>
          or
        </div>

        <Link href="/register" className="btn btn-secondary btn-full">
          Create a New Account
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
