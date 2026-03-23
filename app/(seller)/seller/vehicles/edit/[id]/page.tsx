"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { dynamicData, SriLankanDistricts } from "@/settings";

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    type: "",
    make: "",
    model: "",
    year: "",
    fuelType: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: "",
    withDriver: false,
    district: "",
    latitude: "",
    longitude: "",
    description: "",
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "set" | "error">("idle");
  const [saved, setSaved] = useState(false);

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    async function fetchVehicle() {
      const { data, error } = await supabase
        .from("uploaded_rent_vehicles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        alert("Error loading vehicle");
        router.push("/seller/dashboard");
        return;
      }
      setForm({
        type: data.type || "",
        make: data.make || "",
        model: data.model || "",
        year: data.year?.toString() || "",
        fuelType: data.fuel_type || "Petrol",
        dailyRate: data.daily_rate?.toString() || "",
        weeklyRate: data.weekly_rate?.toString() || "",
        monthlyRate: data.monthly_rate?.toString() || "",
        withDriver: data.with_driver ?? false,
        district: data.district || "",
        latitude: data.latitude?.toString() || "",
        longitude: data.longitude?.toString() || "",
        description: data.description || "",
      });
      if (data.latitude) setGpsStatus("set");
      setPageLoading(false);
    }
    fetchVehicle();
  }, [id]);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from("uploaded_rent_vehicles")
        .update({
          type: form.type,
          make: form.make,
          model: form.model,
          year: parseInt(form.year),
          fuel_type: form.fuelType,
          daily_rate: parseFloat(form.dailyRate),
          weekly_rate: form.weeklyRate ? parseFloat(form.weeklyRate) : null,
          monthly_rate: form.monthlyRate ? parseFloat(form.monthlyRate) : null,
          with_driver: form.withDriver,
          district: form.district,
          latitude: form.latitude || null,
          longitude: form.longitude || null,
          description: form.description || "",
        })
        .eq("id", id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading ───
  if (pageLoading)
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
          <p className="label">Loading vehicle data...</p>
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
          <div>
            <h1 style={{ fontSize: "1.6rem", marginBottom: "4px" }}>
              ✏️ Edit Vehicle
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
              {form.make} {form.model} {form.year && `(${form.year})`}
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

        {/* ─── Manage Images CTA ─── */}
        <button
          onClick={() => router.push(`/seller/vehicles/edit/images/${id}`)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-card)",
            border: "2px dashed var(--border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-4) var(--space-5)",
            marginBottom: "var(--space-6)",
            cursor: "pointer",
            transition: "var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.background = "var(--color-primary-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.background = "var(--bg-card)";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>🖼️</span>
            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Manage Vehicle Images
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  marginTop: "2px",
                }}
              >
                Replace or delete individual photos
              </p>
            </div>
          </div>
          <span
            style={{
              color: "var(--text-tertiary)",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            {"→"}
          </span>
        </button>

        {/* ─── Success toast ─── */}
        {saved && (
          <div
            className="alert alert-success animate-fade-in"
            style={{ marginBottom: "var(--space-5)" }}
          >
            ✅ Vehicle details saved successfully!
          </div>
        )}

        <form
          onSubmit={handleUpdate}
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
              {/* Type — full width */}
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
                  Toggle if driver availability has changed
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
                      ? `✅ ${form.latitude}, ${form.longitude} — Click to update`
                      : gpsStatus === "error"
                        ? "❌ GPS Failed — Try Again"
                        : "🎯 Use My Current Location"}
                </button>
              </div>
            </div>
          </div>

          {/* ─── Submit ─── */}
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-full btn-lg"
          >
            {saving ? "⏳ Saving Changes..." : "💾 Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
