"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { dynamicData, SriLankanDistricts } from "@/settings";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  district: string;
  daily_rate: number;
  image_urls: string[];
  seller_id: string | null;
  manual_seller_name?: string;
  manual_seller_phone?: string;
  created_at: string;
};

const defaultForm = {
  type: dynamicData.vehicle_types[0] as string,
  make: "",
  model: "",
  year: new Date().getFullYear().toString(),
  fuelType: "Petrol",
  dailyRate: "",
  weeklyRate: "",
  monthlyRate: "",
  withDriver: false,
  district: "",
  latitude: "",
  longitude: "",
  description: "",
  seat_count: "4",
  sellerName: "",
  sellerPhone: "",
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // 4 fixed photo slots logic from seller upload
  const [slots, setSlots] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("uploaded_rent_vehicles").select("*").order("created_at", { ascending: false });
    if (search) {
      query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,district.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (!error) setVehicles(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const set = (field: keyof typeof defaultForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSlotSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newSlots = [...slots];
    const newPreviews = [...previews];
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    const { error } = await supabase.from("uploaded_rent_vehicles").delete().eq("id", id);
    if (!error) {
      setToast({ msg: "Vehicle deleted", type: "success" });
      fetchVehicles();
    } else {
      setToast({ msg: error.message, type: "error" });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude.toFixed(6));
        set("longitude", pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        alert("GPS failed to acquire location.");
      }
    );
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slots.filter(Boolean).length === 0) return alert("Please add at least 1 photo.");
    if (!form.district) return alert("Please select a district.");
    
    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

      // Upload images
      for (const file of slots) {
        if (!file) continue;
        if (!ALLOWED_TYPES.includes(file.type)) throw new Error(`Invalid type for ${file.name}`);
        
        const path = `manual-admin/${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const { error: upErr } = await supabase.storage.from("vehicle-images").upload(path, file);
        if (upErr) throw upErr;
        
        const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      // Insert vehicle with ALL fields
      const { error: vehErr } = await supabase.from("uploaded_rent_vehicles").insert({
        type: form.type,
        make: form.make,
        model: form.model,
        year: parseInt(form.year),
        image_urls: uploadedUrls,
        fuel_type: form.fuelType,
        daily_rate: parseFloat(form.dailyRate),
        weekly_rate: form.weeklyRate ? parseFloat(form.weeklyRate) : null,
        monthly_rate: form.monthlyRate ? parseFloat(form.monthlyRate) : null,
        with_driver: form.withDriver,
        district: form.district,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        description: form.description,
        seat_count: form.seat_count ? parseInt(form.seat_count) : null,
        seller_id: null, // Admin manual entry
        manual_seller_name: form.sellerName,
        manual_seller_phone: form.sellerPhone,
      });

      if (vehErr) throw vehErr;

      setToast({ msg: "Vehicle added manually with photos!", type: "success" });
      setShowAddModal(false);
      fetchVehicles();
      // Reset
      setForm(defaultForm);
      setSlots([null, null, null, null]);
      setPreviews([null, null, null, null]);
    } catch (err: any) {
      setToast({ msg: err.message, type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", padding: "12px 24px", borderRadius: "12px",
          background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", fontWeight: 600, zIndex: 1000
        }}>
          {toast.msg}
        </div>
      )}

      <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Vehicle Inventory</h1>
          <p style={{ color: "#64748b" }}>Manage all vehicle listings on the platform.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add Full Listing Manually</button>
      </header>

      <div style={{ marginBottom: "24px" }}>
        <input
          style={{ width: "100%", maxWidth: "400px", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
          placeholder="Search make, model, district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {loading ? (
          <p>Loading vehicles...</p>
        ) : vehicles.map((v) => (
          <div key={v.id} style={styles.card}>
            <div style={{ height: "160px", background: "#f1f5f9", borderRadius: "12px", marginBottom: "16px", overflow: "hidden", position: "relative" }}>
              {v.image_urls?.[0] ? (
                <img src={v.image_urls[0]} alt={v.model} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🚗</div>
              )}
              <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem" }}>
                {v.type}
              </div>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>{v.make} {v.model} ({v.year})</h3>
            <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "4px" }}>📍 {v.district} · Rs. {v.daily_rate}/day</p>
            <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "12px" }}>
              Seller: {v.manual_seller_name || "Registered User"}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>ID: {v.id.slice(0, 8)}...</div>
              <button onClick={() => handleDelete(v.id)} style={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div style={styles.modal}>
            <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ fontWeight: 700 }}>Full Manual Vehicle Entry</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleManualAdd} style={{ padding: "24px", maxHeight: "85vh", overflowY: "auto" }}>
              
              {/* photos */}
              <h3 style={styles.sectionTitle}>Vehicle Photos (Add up to 4)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "32px" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ position: "relative", aspectRatio: "1/1", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #e2e8f0", overflow: "hidden" }}>
                    {previews[i] ? (
                      <>
                        <img src={previews[i]!} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button type="button" onClick={() => handleSlotRemove(i)} style={styles.removePhotoBtn}>✕</button>
                      </>
                    ) : (
                      <label style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <input type="file" hidden accept="image/*" onChange={(e) => handleSlotSelect(i, e)} />
                        <span style={{ fontSize: "1.5rem" }}>+</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <h3 style={styles.sectionTitle}>Seller Info (Manual)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <input required style={styles.input} value={form.sellerName} onChange={(e) => set("sellerName", e.target.value)} placeholder="Seller Name" />
                <input required style={styles.input} value={form.sellerPhone} onChange={(e) => set("sellerPhone", e.target.value)} placeholder="Seller Phone" />
              </div>

              <h3 style={styles.sectionTitle}>Vehicle Core Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <select style={styles.input} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {dynamicData.vehicle_types.map(t => <option key={t}>{t}</option>)}
                </select>
                <select required style={styles.input} value={form.district} onChange={(e) => set("district", e.target.value)}>
                  <option value="">Select District</option>
                  {SriLankanDistricts.map(d => <option key={d}>{d}</option>)}
                </select>
                <input required style={styles.input} value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="Make (e.g. Toyota)" />
                <input required style={styles.input} value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Model (e.g. Vitz)" />
                <input required type="number" style={styles.input} value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="Year" />
                <input type="number" style={styles.input} value={form.seat_count} onChange={(e) => set("seat_count", e.target.value)} placeholder="Seats" />
                <select style={styles.input} value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)}>
                  {["Petrol", "Diesel", "Hybrid", "Electric"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              <h3 style={styles.sectionTitle}>Rates (Rs.)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <input required type="number" style={styles.input} value={form.dailyRate} onChange={(e) => set("dailyRate", e.target.value)} placeholder="Daily" />
                <input type="number" style={styles.input} value={form.weeklyRate} onChange={(e) => set("weeklyRate", e.target.value)} placeholder="Weekly" />
                <input type="number" style={styles.input} value={form.monthlyRate} onChange={(e) => set("monthlyRate", e.target.value)} placeholder="Monthly" />
              </div>

              <h3 style={styles.sectionTitle}>Location & Options</h3>
              <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center" }}>
                <button type="button" onClick={handleGPS} disabled={gpsLoading} style={styles.gpsBtn}>
                  {gpsLoading ? "..." : "🎯 Set GPS"}
                </button>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{form.latitude ? `${form.latitude}, ${form.longitude}` : "No GPS"}</span>
                <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem" }}>
                  <input type="checkbox" checked={form.withDriver} onChange={(e) => set("withDriver", e.target.checked)} />
                  With Driver
                </label>
              </div>

              <textarea style={{ ...styles.input, minHeight: "80px", marginBottom: "24px" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Vehicle Description..." />

              <button type="submit" disabled={submitting} style={styles.saveBtn}>
                {submitting ? "Processing Upload..." : "Publish Listing"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  addBtn: { padding: "12px 24px", borderRadius: "10px", background: "#0f172a", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" },
  card: { background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  deleteBtn: { padding: "4px 12px", borderRadius: "6px", background: "#fee2e2", color: "#ef4444", border: "none", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" },
  modal: { background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "700px" },
  sectionTitle: { fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "12px", letterSpacing: "0.05em" },
  input: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "0.9rem" },
  saveBtn: { width: "100%", padding: "16px", borderRadius: "12px", border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, cursor: "pointer" },
  gpsBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "0.85rem" },
  removePhotoBtn: { position: "absolute", top: "5px", right: "5px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "10px", cursor: "pointer" }
};
