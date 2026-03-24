"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { dynamicData, SriLankanDistricts } from "@/settings";

const defaultForm = {
  type: dynamicData.vehicle_types[0] as string,
  make: "",
  model: "",
  year: "",
  fuelType: "Petrol",
  dailyRate: "",
  weeklyRate: "",
  monthlyRate: "",
  withDriver: false,
  district: "",
  latitude: "",
  longitude: "",
  description: "",
  seat_count: "",
};

export default function UploadVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "set" | "error">("idle");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // With this — 4 fixed slots:
  const [slots, setSlots] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    async function checkVerification() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("is_verified")
        .eq("id", user.id)
        .single();
      setIsVerified(data?.is_verified ?? false);
    }
    checkVerification();
  }, []);

  const set = (field: keyof typeof defaultForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSlotSelect = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newSlots = [...slots];
    const newPreviews = [...previews];

    // Revoke old URL if replacing
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);

    newSlots[index] = file;
    newPreviews[index] = URL.createObjectURL(file);

    setSlots(newSlots);
    setPreviews(newPreviews);
  };

  const handleSlotRemove = (index: number) => {
    const newSlots = [...slots];
    const newPreviews = [...previews];

    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);

    newSlots[index] = null;
    newPreviews[index] = null;

    setSlots(newSlots);
    setPreviews(newPreviews);
  };

  const filledCount = slots.filter(Boolean).length;
  const allFilled = filledCount === 4;

  const handleGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude.toFixed(6));
        set("longitude", pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
        setGpsStatus("set");
      },
      () => {
        setGpsLoading(false);
        setGpsStatus("error");
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled) return alert("Please add all 4 photos.");
    if (!form.district) return alert("Please select your district.");
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first.");
      const uploadedUrls: string[] = [];
      const MAX_SIZE_MB = 5;
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

      for (const file of slots) {
        if (!file) continue;

        // ----------------------
        // ─── Validate type ───
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(
            `Invalid file type: ${file.name}. Only JPG, PNG, WEBP allowed.`,
          );
        }

        // ─── Validate size ───
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          throw new Error(
            `${file.name} is too large. Max size is ${MAX_SIZE_MB}MB.`,
          );
        }

        // ─── Validate it's actually an image by reading header bytes ───
        const buffer = await file.arrayBuffer();
        // const bytes = new Uint8Array(buffer).slice(0, 4);
        // const hex = Array.from(bytes)
        //           .map((b) => b.toString(16).padStart(2, "0"))
        //           .join("");
        const bytes = new Uint8Array(buffer).slice(0, 12);
        const hex = Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const isJpeg = hex.startsWith("ffd8ff");

        // 2. Better WebP check: Must start with RIFF (52494646)
        // AND contain "WEBP" (57454250) at the 8th byte
        const isWebp =
          hex.startsWith("52494646") && hex.slice(16, 24) === "57454250";

        // 3. PNG is already perfect in your code
        const isPng = hex.startsWith("89504e47");

        if (!isJpeg && !isPng && !isWebp) {
          throw new Error(`${file.name} is not a valid image file.`);
        }
        // ----------------------

        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const { error: upErr } = await supabase.storage
          .from("vehicle-images")
          .upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage
          .from("vehicle-images")
          .getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      const { error } = await supabase.from("uploaded_rent_vehicles").insert([
        {
          type: form.type,
          make: form.make,
          model: form.model,
          year: parseInt(form.year),
          seller_id: user.id,
          image_urls: uploadedUrls,
          fuel_type: form.fuelType,
          daily_rate: parseFloat(form.dailyRate),
          weekly_rate: form.weeklyRate ? parseFloat(form.weeklyRate) : null,
          monthly_rate: form.monthlyRate ? parseFloat(form.monthlyRate) : null,
          with_driver: form.withDriver,
          district: form.district,
          latitude: form.latitude || null,
          longitude: form.longitude || null,
          description: form.description || "",
          seat_count: form.seat_count || null,
        },
      ]);
      if (error) throw error;
      alert("Vehicle uploaded successfully!");
      router.push("/seller/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Checking state ───
  if (isVerified === null)
    return (
      <div
        className="page"
        style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "3px solid var(--red-100)",
              borderTopColor: "var(--color-primary)",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto var(--space-4)",
            }}
          />
          <p className="label">Checking account status...</p>
        </div>
      </div>
    );

  // ─── Not verified gate ───
  if (isVerified === false)
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
            maxWidth: "380px",
            width: "100%",
            padding: "var(--space-8)",
            textAlign: "center",
            borderColor: "var(--color-warning-border)",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>🔒</p>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "var(--space-2)" }}>
            Verification Required
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-tertiary)",
              marginBottom: "var(--space-6)",
              lineHeight: 1.6,
            }}
          >
            You need to verify your account before listing vehicles. Add your
            phone number to get verified instantly.
          </p>
          <button
            onClick={() => router.push("/seller/profile/edit")}
            className="btn btn-primary btn-full"
          >
            👤 Complete Profile & Verify
          </button>
        </div>
      </div>
    );

  return (
    <div className="page" style={{ paddingBottom: "var(--space-16)" }}>
      <div className="container-sm" style={{ paddingTop: "var(--space-8)" }}>
        {/* ─── Header ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "var(--space-8)",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ marginBottom: "var(--space-8)" }}>
            <h1 style={{ fontSize: "1.6rem", marginBottom: "4px" }}>
              🚗 Add a New Vehicle
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
              Fill in the details to list your vehicle for rent
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
            style={{ flexShrink: 0 }}
          >
            {"←"} Dashboard
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          {/* ─── SECTION 1: Vehicle Details ─── */}
          <div className="section-card">
            <p className="section-card-title">🔧 Vehicle Details</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-4)",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Vehicle Type</label>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className="input select"
                >
                  {dynamicData.vehicle_types.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Make <span className="required">*</span>
                </label>
                <input
                  value={form.make}
                  onChange={(e) => set("make", e.target.value)}
                  placeholder="e.g. Toyota"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">
                  Model <span className="required">*</span>
                </label>
                <input
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="e.g. Premio"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">
                  Year <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                  placeholder="e.g. 2019"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  className="input"
                />
              </div>
              <div>
                <label className="form-label">
                  Seats <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={form.seat_count}
                  onChange={(e) => set("seat_count", e.target.value)}
                  placeholder="e.g. 4 seats"
                  required
                  min="1"
                  max="100"
                  className="input"
                />
              </div>

              <div>
                <label className="form-label">Fuel Type</label>
                <select
                  value={form.fuelType}
                  onChange={(e) => set("fuelType", e.target.value)}
                  className="input select"
                >
                  {["Petrol", "Diesel", "Hybrid", "Electric"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: "8px" }}>
              <label className="form-label">
                Description <span className="optional">(Optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="e.g. Call me for more info..."
                rows={3}
                className="input textarea"
              />
            </div>
          </div>

          {/* ─── SECTION 2: Pricing ─── */}
          <div className="section-card">
            <p className="section-card-title">💰 Pricing (Rs.)</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "var(--space-4)",
              }}
            >
              <div>
                <label className="form-label">
                  Daily Rate <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={form.dailyRate}
                  onChange={(e) => set("dailyRate", e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="form-label">
                  Weekly <span className="optional">(optional)</span>
                </label>
                <input
                  type="number"
                  value={form.weeklyRate}
                  onChange={(e) => set("weeklyRate", e.target.value)}
                  placeholder="e.g. 30000"
                  className="input"
                />
              </div>
              <div>
                <label className="form-label">
                  Monthly <span className="optional">(optional)</span>
                </label>
                <input
                  type="number"
                  value={form.monthlyRate}
                  onChange={(e) => set("monthlyRate", e.target.value)}
                  placeholder="e.g. 100000"
                  className="input"
                />
              </div>
            </div>

            {/* Driver toggle */}
            <div
              onClick={() => set("withDriver", !form.withDriver)}
              className={`driver-toggle ${form.withDriver ? "active" : ""}`}
              style={{ marginTop: "var(--space-4)" }}
            >
              <div
                className={`driver-toggle-check ${form.withDriver ? "active" : ""}`}
              >
                {form.withDriver && "✓"}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  👨‍✈️ Vehicle includes a driver
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    marginTop: "2px",
                  }}
                >
                  Check this if a driver is provided with the rental
                </p>
              </div>
            </div>
          </div>

          {/* ─── SECTION 3: Location ─── */}
          <div className="section-card">
            <p className="section-card-title">📍 Location</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              <div>
                <label className="form-label">
                  District <span className="required">*</span>
                </label>
                <select
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  required
                  className="input select"
                >
                  <option value="">Select your district</option>
                  {SriLankanDistricts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  GPS Coordinates{" "}
                  <span className="optional">(optional but recommended)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGPS}
                  disabled={gpsLoading}
                  className={`gps-btn ${
                    gpsStatus === "set"
                      ? "gps-set"
                      : gpsStatus === "error"
                        ? "gps-error"
                        : ""
                  }`}
                >
                  {gpsLoading
                    ? "⏳ Accessing GPS..."
                    : gpsStatus === "set"
                      ? `✅ Location Set — ${form.latitude}, ${form.longitude}`
                      : gpsStatus === "error"
                        ? "❌ GPS Failed — Try Again"
                        : "🎯 Use My Current Location"}
                </button>
              </div>
            </div>
          </div>

          {/* ─── SECTION 4: Images ─── */}
          <div className="section-card">
            <p className="section-card-title">🖼️ Vehicle Photos</p>

            {/* Progress indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)",
              }}
            >
              <p
                style={{ fontSize: "0.83rem", color: "var(--text-secondary)" }}
              >
                {filledCount === 0 && "Add 4 photos of your vehicle"}
                {filledCount > 0 &&
                  filledCount < 4 &&
                  `${4 - filledCount} more photo${4 - filledCount > 1 ? "s" : ""} needed`}
                {allFilled && "✅ All photos added — ready to submit!"}
              </p>
              {/* Progress pills */}
              <div style={{ display: "flex", gap: "4px" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "20px",
                      height: "4px",
                      borderRadius: "var(--radius-full)",
                      background: slots[i]
                        ? "var(--color-primary)"
                        : "var(--border-default)",
                      transition: "var(--transition-normal)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 4 Slots Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "var(--space-3)",
              }}
            >
              {[0, 1, 2, 3].map((i) => {
                const hasPhoto = !!slots[i];
                const preview = previews[i];
                const isCover = i === 0;

                return (
                  <div key={i} style={{ position: "relative" }}>
                    {hasPhoto ? (
                      // ── Filled slot ──
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "4/3",
                          borderRadius: "var(--radius-xl)",
                          overflow: "hidden",
                          border: isCover
                            ? "2px solid var(--color-primary)"
                            : "2px solid var(--color-success)",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <img
                          src={preview!}
                          alt={`Photo ${i + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        {/* Overlay on hover — shows actions */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgb(0 0 0 / 0.45)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "var(--space-2)",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "0")
                          }
                        ></div>

                        {/* Badge */}
                        <span
                          className={`badge ${isCover ? "badge-red" : "badge-green"}`}
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                          }}
                        >
                          {isCover ? "★ Cover Photo" : `Photo ${i + 1}`}
                        </span>

                        {/* Mobile remove button (always visible) */}
                        <button
                          type="button"
                          onClick={() => handleSlotRemove(i)}
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            background: "rgb(0 0 0 / 0.6)",
                            border: "none",
                            color: "white",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      // ── Empty slot ──
                      <label
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          aspectRatio: "4/3",
                          borderRadius: "var(--radius-xl)",
                          border: "2px dashed var(--border-default)",
                          background: "var(--bg-subtle)",
                          cursor: "pointer",
                          transition: "var(--transition-fast)",
                          gap: "var(--space-2)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--color-primary)";
                          e.currentTarget.style.background =
                            "var(--color-primary-light)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--border-default)";
                          e.currentTarget.style.background = "var(--bg-subtle)";
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleSlotSelect(i, e)}
                        />

                        {/* Plus icon */}
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "var(--bg-card)",
                            border: "1.5px solid var(--border-default)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            boxShadow: "var(--shadow-xs)",
                          }}
                        >
                          📷
                        </div>

                        <div style={{ textAlign: "center" }}>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {isCover ? "Add Cover Photo" : `Add Photo ${i + 1}`}
                          </p>
                          <p
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-tertiary)",
                              marginTop: "2px",
                            }}
                          >
                            {isCover ? "Shown in listings" : "Tap to select"}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Help text */}
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                marginTop: "var(--space-4)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              💡 The <strong>Cover Photo</strong> (slot 1) is what renters see
              first in search results. Choose your best photo for the cover!
            </p>
          </div>

          {/* ─── Submit ─── */}
          <button
            type="submit"
            disabled={loading || !allFilled}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? "⏳ Uploading Vehicle..." : "🚀 Submit Vehicle"}
          </button>
        </form>
      </div>
    </div>
  );
}
