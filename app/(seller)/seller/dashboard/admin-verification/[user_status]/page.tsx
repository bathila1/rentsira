"use client";
import { settingsData } from "@/settings";
import Link from "next/link";
import { useParams } from "next/navigation";

const AdminVerificationPage = () => {
  const { user_status } = useParams();
  const userStatus = user_status as string;
  return (
    <div
      className="page"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: "var(--space-6)",
      }}
    >
      <div
        className="card animate-fade-in-scale"
        style={{
          maxWidth: "460px",
          width: "100%",
          padding: "var(--space-8)",
        }}
      >
        {/* Header */}
        <div>
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
            style={{display: "inline-flex" }}
          >
            {"←"} Back to Home
          </Link>
        </div>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--color-warning-light)",
              border: "2px solid var(--color-warning-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              margin: "0 auto var(--space-4)",
            }}
          >
            🔒
          </div>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "var(--space-2)" }}>
            Please wait till admins approve your account. Call{" "}
            <Link href="tel:{settingsData.SupportWhatsappNumber}">
              {settingsData.SupportWhatsappNumber}
            </Link>{" "}
            for instant approval
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-tertiary)",
              lineHeight: 1.7,
              maxWidth: "320px",
              margin: "0 auto",
            }}
          >
            You have to wait till admins approve your account to Post Vehicles
          </p>

          <div>
            <h3
              style={{
                color: "blue",
              }}
            >
              {userStatus?.toUpperCase()}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationPage;
