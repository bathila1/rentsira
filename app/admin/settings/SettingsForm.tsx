"use client";

import { useActionState, useState } from "react";
import { saveSiteSettings, type SaveResult } from "./actions";
import type { SiteSettings } from "@/utils/site-settings";
import { settingsData } from "@/settings";

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  marginBottom: "24px",
};

function Toggle({
  name,
  checked,
  onChange,
  title,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        cursor: "pointer",
        padding: "16px",
        borderRadius: "12px",
        border: "1.5px solid " + (checked ? "#10b981" : "#e2e8f0"),
        background: checked ? "#f0fdf4" : "#f8fafc",
      }}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: 20,
          height: 20,
          marginTop: 2,
          flexShrink: 0,
          accentColor: "#10b981",
        }}
      />
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "0.95rem",
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "block",
            color: "#64748b",
            fontSize: "0.85rem",
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </span>
      </span>
    </label>
  );
}

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [state, formAction, pending] = useActionState<
    SaveResult | null,
    FormData
  >(saveSiteSettings, null);

  const [payments, setPayments] = useState(initial.payments_enabled);
  const [freeBump, setFreeBump] = useState(initial.free_bump_enabled);
  const [mode, setMode] = useState<"sandbox" | "live">(initial.payhere_mode);

  return (
    <form action={formAction}>
      {state && (
        <div
          style={{
            ...card,
            background: state.ok ? "#f0fdf4" : "#fef2f2",
            border: "1px solid " + (state.ok ? "#bbf7d0" : "#fecaca"),
            color: state.ok ? "#15803d" : "#b91c1c",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {state.ok ? "✅ " : "❌ "}
          {state.message}
        </div>
      )}

      <div style={card}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>
          Payment Gateway
        </h2>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.875rem",
            marginBottom: "20px",
          }}
        >
          While this is off, nothing on the site asks a customer for money. Paid
          features stay free and every payment button is replaced with a
          WhatsApp contact button.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Toggle
            name="payments_enabled"
            checked={payments}
            onChange={(v) => {
              setPayments(v);
              // Live mode is meaningless with payments off, so reset it.
              if (!v) setMode("sandbox");
            }}
            title="Enable PayHere payments"
            hint="Turn on only once your PayHere account is approved and live credentials are in place."
          />

          <Toggle
            name="free_bump_enabled"
            checked={freeBump}
            onChange={setFreeBump}
            title="Allow free listing bumps"
            hint="Lets sellers bump their listings at no charge. Keep this on while payments are disabled, otherwise bumping is unavailable to everyone."
          />
        </div>

        {/* Mode picker is only meaningful once payments are enabled. */}
        <div
          style={{
            marginTop: "20px",
            opacity: payments ? 1 : 0.5,
            pointerEvents: payments ? "auto" : "none",
          }}
        >
          <p
            style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "10px" }}
          >
            PayHere mode
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {(["sandbox", "live"] as const).map((m) => (
              <label
                key={m}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "1.5px solid " + (mode === m ? "#3b82f6" : "#e2e8f0"),
                  background: mode === m ? "#eff6ff" : "#fff",
                  color: mode === m ? "#1d4ed8" : "#64748b",
                }}
              >
                <input
                  type="radio"
                  name="payhere_mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  style={{ accentColor: "#3b82f6" }}
                />
                {m === "sandbox" ? "Sandbox (test)" : "Live (real money)"}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Plain-language summary so the consequence of the switches is obvious. */}
      <div style={card}>
        <h2
          style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px" }}
        >
          What visitors see right now
        </h2>
        <ul
          style={{
            paddingLeft: "20px",
            color: "#475569",
            fontSize: "0.875rem",
            lineHeight: 1.9,
          }}
        >
          {payments ? (
            <li>
              Paid features go through PayHere in{" "}
              <strong>{mode === "live" ? "LIVE" : "sandbox"}</strong> mode.
            </li>
          ) : (
            <li>
              Payment buttons are hidden. Customers get a WhatsApp button to{" "}
              <strong>{settingsData.SupportWhatsappNumber}</strong> instead.
            </li>
          )}
          <li>
            Listing bumps are{" "}
            <strong>{freeBump ? "free for all sellers" : "unavailable"}</strong>.
          </li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          background: pending ? "#94a3b8" : "#0f172a",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          padding: "12px 28px",
          fontSize: "0.95rem",
          fontWeight: 700,
          cursor: pending ? "not-allowed" : "pointer",
        }}
      >
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
