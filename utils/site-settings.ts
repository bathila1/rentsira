/**
 * Site-wide feature flags, editable by the admin at /admin/settings.
 *
 * This module is deliberately free of any server-only import so that client
 * components (the bump modal, for one) can share these types and the coercion
 * helper. The server-side reader lives in ./site-settings.server.
 */

export type SiteSettings = {
  /** Master switch for the PayHere gateway. While false, everything paid is free. */
  payments_enabled: boolean;
  /** Which PayHere credentials the checkout should use once payments are on. */
  payhere_mode: "sandbox" | "live";
  /** Lets sellers bump listings for free while payments are disabled. */
  free_bump_enabled: boolean;
};

/**
 * Fallback used whenever the flags cannot be read.
 *
 * Payments default to OFF on purpose. PayHere is still on sandbox credentials,
 * so a failed read must never present a real customer with a checkout that
 * cannot take their money.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  payments_enabled: false,
  payhere_mode: "sandbox",
  free_bump_enabled: true,
};

/** Normalises a raw database row (or nothing at all) into SiteSettings. */
export function coerceSettings(
  row: Record<string, unknown> | null | undefined,
): SiteSettings {
  if (!row) return DEFAULT_SETTINGS;
  return {
    payments_enabled: row.payments_enabled === true,
    payhere_mode: row.payhere_mode === "live" ? "live" : "sandbox",
    free_bump_enabled: row.free_bump_enabled !== false,
  };
}
