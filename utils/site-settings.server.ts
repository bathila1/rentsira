import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  DEFAULT_SETTINGS,
  coerceSettings,
  type SiteSettings,
} from "@/utils/site-settings";

/**
 * Server-side reader for the admin feature flags.
 *
 * Kept apart from ./site-settings so that importing the types from a client
 * component does not drag next/headers into the browser bundle.
 *
 * If the `site_settings` table does not exist yet, or the read fails for any
 * reason, this returns DEFAULT_SETTINGS — which keeps payments disabled.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("payments_enabled, payhere_mode, free_bump_enabled")
      .eq("id", 1)
      .maybeSingle();

    if (error) return DEFAULT_SETTINGS;
    return coerceSettings(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
});
