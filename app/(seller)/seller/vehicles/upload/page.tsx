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
};

export default function UploadVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "set" | "error">("idle");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

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

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

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
    if (imageFiles.length !== 4)
      return alert("Please select exactly 4 images.");
    if (!form.district) return alert("Please select your district.");
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first.");
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
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
            onClick={() => router.push("/seller/dashboard")}
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
                  min="1990"
                  max="2025"
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
            <p className="section-card-title">🖼️ Vehicle Images</p>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-tertiary)",
                marginBottom: "var(--space-3)",
              }}
            >
              Select exactly 4 images. The first image will be the cover photo
              shown in listings.
            </p>

            {/* Drop zone */}
            <label
              style={{
                display: "block",
                width: "100%",
                border:
                  imageFiles.length === 4
                    ? "2px solid var(--color-success)"
                    : "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-8) var(--space-4)",
                textAlign: "center",
                cursor: "pointer",
                transition: "var(--transition-normal)",
                background:
                  imageFiles.length === 4
                    ? "var(--color-success-light)"
                    : "var(--bg-subtle)",
                boxSizing: "border-box",
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                style={{ display: "none" }}
              />

              {/* Icon */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background:
                    imageFiles.length === 4
                      ? "var(--color-success-light)"
                      : "var(--bg-card)",
                  border: "1.5px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-3)",
                  fontSize: "1.4rem",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {imageFiles.length === 4 ? "✅" : "📷"}
              </div>

              {/* Text */}
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.01em",
                }}
              >
                {imageFiles.length === 0
                  ? "Click to select photos"
                  : imageFiles.length === 4
                    ? "4 photos selected ✓"
                    : `${imageFiles.length} of 4 selected`}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  marginTop: "4px",
                }}
              >
                JPG, PNG, WEBP • Exactly 4 required
              </p>

              {/* Progress dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  marginTop: "var(--space-4)",
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "28px",
                      height: "4px",
                      borderRadius: "var(--radius-full)",
                      background:
                        i < imageFiles.length
                          ? "var(--color-primary)"
                          : "var(--border-default)",
                      transition: "var(--transition-normal)",
                    }}
                  />
                ))}
              </div>
            </label>

            {/* Previews */}
            {previews.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "var(--space-2)",
                  marginTop: "var(--space-4)",
                }}
              >
                {previews.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                      border:
                        i === 0
                          ? "2px solid var(--color-primary)"
                          : "1.5px solid var(--border-default)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {i === 0 && (
                      <span
                        className="badge badge-red"
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          left: "6px",
                        }}
                      >
                        ★ Cover
                      </span>
                    )}
                    {i !== 0 && (
                      <span
                        className="badge badge-dark"
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          left: "6px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Submit ─── */}
          <button
            type="submit"
            disabled={loading || imageFiles.length !== 4}
            className="btn btn-primary btn-full btn-lg"
          >
            {loading ? "⏳ Uploading Vehicle..." : "🚀 Submit Vehicle"}
          </button>
        </form>
      </div>
    </div>
  );
}
