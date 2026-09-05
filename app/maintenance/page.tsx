import type { Metadata } from "next";
import { settingsData } from "@/settings";

export const metadata: Metadata = {
  title: "We’ll be back shortly",
  description: "Renta.lk is briefly down for maintenance.",
  // A maintenance page must never be the version Google keeps in its index.
  robots: { index: false, follow: false },
};

/**
 * Target of the NEXT_PUBLIC_MAINTENANCE_MODE redirect in the middleware.
 *
 * This route did not exist before, so switching maintenance mode on sent every
 * visitor to a 404 instead of an explanation.
 */
export default function MaintenancePage() {
  const wa = settingsData.SupportWhatsappNumber.replace(/\D/g, "");

  return (
    <main className="maintenance">
      <span className="maintenance-icon" aria-hidden="true">
        🔧
      </span>

      <h1 className="maintenance-title">We’ll be back shortly</h1>

      <p className="maintenance-text">
        Renta.lk is down for a short spell of maintenance. Nothing is wrong with
        your account or your listings — please try again in a few minutes.
      </p>

      <a
        href={`https://wa.me/${wa}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-lg"
        style={{ textDecoration: "none" }}
      >
        Message us on WhatsApp
      </a>
    </main>
  );
}
