"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@renta.lk";

export type SaveResult = { ok: boolean; message: string };

/**
 * Persist the admin feature flags.
 *
 * The identity check is repeated here on purpose: a Server Action is a public
 * POST endpoint, so it cannot rely on the /admin layout having gated the page.
 */
export async function saveSiteSettings(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return { ok: false, message: "Not authorised." };
  }

  const payments_enabled = formData.get("payments_enabled") === "on";
  const free_bump_enabled = formData.get("free_bump_enabled") === "on";
  const rawMode = formData.get("payhere_mode");
  const payhere_mode = rawMode === "live" ? "live" : "sandbox";

  // Guard rail: going live is a money-moving change, so it must be deliberate.
  // Live credentials only make sense when payments are actually switched on.
  if (payhere_mode === "live" && !payments_enabled) {
    return {
      ok: false,
      message: "Cannot select Live mode while payments are disabled.",
    };
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      payments_enabled,
      payhere_mode,
      free_bump_enabled,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", 1);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42P01"
          ? "The site_settings table does not exist yet. Run supabase/migrations/20260906_site_settings.sql first."
          : `Could not save: ${error.message}`,
    };
  }

  // The public site reads these flags, so drop the cached copies everywhere.
  revalidatePath("/", "layout");

  return { ok: true, message: "Settings saved." };
}
