import { settingsData } from "@/settings";

/** Strips the number down to the digits wa.me expects (94XXXXXXXXX). */
function waDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("94")) digits = "94" + digits;
  return digits;
}

const WA_NUMBER = waDigits(settingsData.SupportWhatsappNumber);

/**
 * Shown wherever a payment would normally happen while the PayHere gateway is
 * switched off in /admin/settings. Rather than a dead end, the customer gets a
 * direct line to support to arrange the same thing manually.
 */
export default function WhatsAppPayButton({
  message,
  label = "Contact us on WhatsApp",
  hint,
  full = true,
}: {
  /** Pre-filled message, so support knows what the enquiry is about. */
  message: string;
  label?: string;
  hint?: string;
  full?: boolean;
}) {
  const href =
    "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);

  return (
    <div style={{ width: full ? "100%" : "auto" }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={"btn btn-lg" + (full ? " btn-full" : "")}
        style={{
          textDecoration: "none",
          justifyContent: "center",
          gap: "10px",
          background: "#25D366",
          color: "#fff",
          border: "none",
          boxShadow: "0 4px 14px 0 rgb(37 211 102 / 0.3)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.842L.057 23.571a.75.75 0 0 0 .921.921l5.733-1.452A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.355l-.355-.211-3.683.933.951-3.68-.23-.373A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
        </svg>
        {label}
      </a>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--text-tertiary)",
          marginTop: "var(--space-2)",
        }}
      >
        {hint ?? "Online payments are coming soon — we will sort you out directly."}
      </p>
    </div>
  );
}
