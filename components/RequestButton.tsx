"use client";
export default function RequestButton() {
  return (
    <div>
      <a
        href="/book"
        className="book-now-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "var(--space-2) var(--space-3)",
          background:
            "radial-gradient(circle at top left, rgb(223, 11, 201), rgb(1, 204, 255))",
          borderRadius: "var(--radius-full)",
          textDecoration: "none",
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.02em",
          marginBottom: "var(--space-2)",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.4s ease infinite",
          }}
        />

        <span
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 5v3h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </span>

        <span style={{ position: "relative" }}> Request</span>
        <svg
          style={{ position: "relative", opacity: 0.8 }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
