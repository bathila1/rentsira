"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { SriLankanDistricts, dynamicData, settingsData } from "@/settings";
import BackButton from "@/app/(user)/explore/[id]/components/BackBtn";
import { sanitizeText } from "@/utils/sanitize";
import Link from "next/link";

type FormState = {
  renter_name: string;
  renter_phone: string;
  vehicle_type: string;
  pickup_district: string;
  pickup_date: string;
  with_driver: boolean;
  seat_count: string;
  notes: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  renter_name: "",
  renter_phone: "",
  vehicle_type: "",
  pickup_district: "",
  pickup_date: "",
  with_driver: false,
  seat_count: "",
  notes: "",
};

export default function BookingRequestPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const today = new Date().toISOString().split("T")[0];

  function validate(): boolean {
    const errors: ValidationErrors = {};

    if (!form.renter_name.trim())
      errors.renter_name = "Please enter your full name";
    if (!form.renter_phone.trim()) {
      errors.renter_phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.renter_phone.replace(/\D/g, ""))) {
      errors.renter_phone = "Please enter a valid 10-digit phone number";
    }

    if (!form.vehicle_type)
      errors.vehicle_type = "Please select a vehicle type";
    if (!form.pickup_district)
      errors.pickup_district = "Please select a pickup district";
    if (!form.pickup_date)
      errors.pickup_date = "Please select your pickup date";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));

    // Clear field error when user fixes it
    if (fieldErrors[name as keyof FormState]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) {
      // window.scrollTo({ top: 0, behavior: "smooth" });
      // return;

      // Scroll to error field this should be accurate so think deeper
      const firstErrorField = document.querySelector(
        `[name="${Object.keys(fieldErrors)[0]}"]`,
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        (firstErrorField as HTMLElement).focus();
      }

      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Direct insert to table instead of invoke to avoid 'res.json' errors
      // and ensure reliability if Edge Function isn't set up.
      const { error: insertError } = await supabase
        .from("booking_requests")
        .insert({
          renter_name: sanitizeText(form.renter_name),
          renter_phone: sanitizeText(form.renter_phone),
          vehicle_type: sanitizeText(form.vehicle_type),
          pickup_district: sanitizeText(form.pickup_district),
          pickup_date: sanitizeText(form.pickup_date),
          with_driver: form.with_driver,
          seat_count: form.seat_count ? parseInt(form.seat_count) : null,
          notes: sanitizeText(form.notes) || null,
          user_id: user?.id ?? null,
          status: "pending",
        });

      if (insertError) throw insertError;

      const emailBody = {
        name: sanitizeText(form.renter_name),
        email: sanitizeText(form.renter_name) + Math.random() + "@gmail.com",
        phone: sanitizeText(form.renter_phone),
        topic: "Booking Request: " + sanitizeText(form.vehicle_type),
        message:
          "renter_name: " +
          sanitizeText(form.renter_name) +
          "\n" +
          "renter_phone: " +
          sanitizeText(form.renter_phone) +
          "\n" +
          "vehicle_type: " +
          sanitizeText(form.vehicle_type) +
          "\n" +
          "pickup_district: " +
          sanitizeText(form.pickup_district) +
          "\n" +
          "pickup_date: " +
          sanitizeText(form.pickup_date) +
          "\n" +
          "with_driver: " +
          form.with_driver +
          "\n" +
          "seat_count: " +
          form.seat_count +
          "\n" +
          "notes: " +
          sanitizeText(form.notes) +
          "\n",
      };

      // 2️⃣ Send email notification
      const { error: fnError } = await supabase.functions.invoke(
        "send-contact-email",
        { body: emailBody },
      );

      if (fnError) throw new Error(fnError.message);

      setSuccess(true);
      setForm(INITIAL_FORM);

      // Redirect after showing success for a while
      setTimeout(() => {
        window.location.href = "/";
      }, 6000);
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setError(
        err.message ||
          "Failed to submit request. Please check your connection.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main style={styles.successPage}>
        
        <div style={styles.successCard}>
          <div style={styles.successIconWrap}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={styles.successTitle}>Request Submitted!</h1>
          <p style={styles.successText}>
            Thank you for choosing SIRAA.LK. We've received your request and our
            team will get back to you shortly to confirm the availability.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <button
              style={{ ...styles.submitBtn, width: "auto" }}
              onClick={() => setSuccess(false)}
            >
              Send Another Request
            </button>
            <a href="/" style={styles.homeLink}>
              Back to Home
            </a>
          </div>
          <p style={styles.redirectHint}>Auto-redirecting in 6 seconds...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* ── Professional Header ── */}
      
      <div style={styles.hero}>
        <div className="container-sm">
          {/* <h1 style={styles.heroTitle}>
            <span style={{ color: "#ffffff" }}>Find Your </span>
            <span style={{ color: "#ef4444" }}>Rental.</span>
          </h1>
          <p style={styles.heroSub}>Fill the form. We'll call you.</p>
           */}
           <div style={styles.supportBadge} >
          <div style={styles.liveIndicator}>
            <div style={styles.pulseDot} />
            <div style={styles.pulseDotInner} />
          </div>
          <span
            style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 }}
          >
            SUPPORT:
          </span>
          <a href={`tel:${settingsData.phone1}`} style={styles.phoneLink}>
            {settingsData.phone3}
          </a>
        </div>
        </div>
      </div>
      

      <div className="container-sm" style={styles.formWrapper}>
        {error && (
          <div style={styles.alertError}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          {/* Step 1: Vehicle */}
          <div style={styles.formCard}>
            {/* <div style={styles.cardBadge}>STEP 1</div> */}
            {/* <h2 style={styles.cardHeading}>Vehicle :</h2> */}
            <div style={styles.inputGrid}>
              <div style={{ gridColumn: "1 / -1" }}>
                {/* <label style={styles.inputLabel}>What type of vehicle? *</label> */}
                <select
                  name="vehicle_type"
                  value={form.vehicle_type}
                  onChange={handleChange}
                  style={{
                    ...styles.selectInput,
                    ...(fieldErrors.vehicle_type ? styles.errorBorder : {}),
                  }}
                >
                  <option value="">Select vehicle type...</option>
                  {(dynamicData?.vehicle_types ?? []).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {fieldErrors.vehicle_type && (
                  <span style={styles.errorMsg}>
                    {fieldErrors.vehicle_type}
                  </span>
                )}
              </div>

              <div  style={{ gridColumn: "1 / -1" }}>
                {/* <label style={styles.inputLabel}>Seats needed?</label> */}
                <input
                  type="number"
                  name="seat_count"
                  placeholder="How many seats? (optional)"
                  value={form.seat_count}
                  onChange={handleChange}
                  style={styles.textInput}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    ...styles.checkLabel,
                    ...(form.with_driver ? styles.checkLabelActive : {}),
                  }}
                >
                  <input
                    type="checkbox"
                    name="with_driver"
                    checked={form.with_driver}
                    onChange={handleChange}
                    style={{
                      accentColor: "#c4ef44",
                    }}
                  />
                  <span>With Driver</span>
                </label>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                {/* <label style={styles.inputLabel}>Your Name *</label> */}
                <input
                  type="text"
                  name="renter_name"
                  placeholder="Enter your name"
                  value={form.renter_name}
                  onChange={handleChange}
                  style={{
                    ...styles.textInput,
                    ...(fieldErrors.renter_name ? styles.errorBorder : {}),
                  }}
                />
                {fieldErrors.renter_name && (
                  <span style={styles.errorMsg}>{fieldErrors.renter_name}</span>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                {/* <label style={styles.inputLabel}>Phone Number *</label> */}
                <input
                  type="tel"
                  name="renter_phone"
                  placeholder="Enter your phone number"
                  value={form.renter_phone}
                  onChange={handleChange}
                  style={{
                    ...styles.textInput,
                    ...(fieldErrors.renter_phone ? styles.errorBorder : {}),
                  }}
                />
                {fieldErrors.renter_phone && (
                  <span style={styles.errorMsg}>
                    {fieldErrors.renter_phone}
                  </span>
                )}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.inputLabel}>Pickup Location *</label>
                <select
                  name="pickup_district"
                  value={form.pickup_district}
                  onChange={handleChange}
                  style={{
                    ...styles.selectInput,
                    ...(fieldErrors.pickup_district ? styles.errorBorder : {}),
                  }}
                >
                  <option value="">Choose district...</option>
                  {SriLankanDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {fieldErrors.pickup_district && (
                  <span style={styles.errorMsg}>
                    {fieldErrors.pickup_district}
                  </span>
                )}
              </div>

               <div style={{ gridColumn: "1 / -1" }}>
                <label style={styles.inputLabel}>Pickup Date *</label>
                <input 
                  type="date" 
                  name="pickup_date" 
                  min={today} 
                  value={form.pickup_date} 
                  onChange={handleChange} 
                  style={{...styles.textInput, ...(fieldErrors.pickup_date ? styles.errorBorder : {})}}
                />
                {fieldErrors.pickup_date && <span style={styles.errorMsg}>{fieldErrors.pickup_date}</span>}
              </div>


            </div>
          </div>

          

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.disabledBtn : {}),
            }}
          >
            {loading ? "Submitting Request..." : "Submit Booking Request"}
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: "0.85rem",
              marginBottom: "10px",
            }}
          >
            By submitting, you agree to our terms of service.
          </p>
        </form>
        <p
          style={{
            textAlign: "center",
            marginBottom: "var(--space-10)",
            fontSize: "0.8rem",
          }}
        >
          {"←"}
          <Link href="/" style={{ color: "blue", textDecoration: "underline" }}>
            Back to Home
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background: "#0f172a",
    padding: "40px",
    color: "#fff",
    borderBottom: "6px solid #ef4444",
  },
  heroTitle: {
    fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
    fontWeight: 900,
    lineHeight: 1,
    marginBottom: "16px",
    fontFamily: "var(--font-display)",
  },
  heroSub: {
    fontSize: "1.1rem",
    color: "#94a3b8",
    maxWidth: "500px",
    marginBottom: "32px",
  },
  supportBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.05)",
    padding: "10px 20px",
    borderRadius: "100px",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "var(--space-4)",
  },
  liveIndicator: { position: "relative", width: "10px", height: "10px" },
  pulseDot: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "#10b981",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },
  pulseDotInner: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "#10b981",
    borderRadius: "50%",
  },
  phoneLink: {
    color: "#fff",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "1.1rem",
  },

  formWrapper: {
    maxWidth: "700px",
    marginTop: "-40px",
    padding: "0 24px",
  },
  formCard: {
    background: "#fff",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
    position: "relative",
  },
  cardBadge: {
    position: "absolute",
    top: "20px",
    right: "40px",
    fontSize: "0.7rem",
    fontWeight: 800,
    color: "#94a3b8",
    letterSpacing: "0.1em",
  },
  cardHeading: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#1e293b",
    marginBottom: "28px",
  },
  inputGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  inputLabel: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#475569",
    marginBottom: "10px",
  },
  textInput: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#f1f5f9",
    background: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.2s",
  },
  selectInput: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#f1f5f9",
    background: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#f1f5f9",
    background: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
    resize: "vertical",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 18px",
    borderRadius: "14px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#f1f5f9",
    background: "#f8fafc",
    cursor: "pointer",
    fontWeight: 600,
    color: "#64748b",
    width: "100%",
    transition: "all 0.2s",
  },
  checkLabelActive: {
    borderColor: "#ef4444",
    color: "#ef4444",
    background: "#fff1f2",
  },
  submitBtn: {
    padding: "20px",
    borderRadius: "20px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "1.2rem",
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
    transition: "transform 0.2s ease",
  },
  disabledBtn: { opacity: 0.6, cursor: "not-allowed" },
  errorBorder: { borderColor: "#fca5a5", background: "#fff5f5" },
  errorMsg: {
    color: "#ef4444",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginTop: "6px",
    display: "block",
  },
  alertError: {
    padding: "16px 24px",
    background: "#fff1f2",
    borderRadius: "16px",
    border: "1px solid #fee2e2",
    color: "#ef4444",
    marginBottom: "24px",
    display: "flex",
    gap: "12px",
    fontWeight: 600,
  },

  successPage: {
    minHeight: "100vh",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  successCard: {
    background: "#fff",
    padding: "60px 40px",
    borderRadius: "40px",
    textAlign: "center",
    maxWidth: "550px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
  },
  successIconWrap: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 32px",
  },
  successTitle: {
    fontSize: "2.2rem",
    fontWeight: 900,
    color: "#1e293b",
    marginBottom: "16px",
  },
  successText: {
    fontSize: "1.1rem",
    color: "#64748b",
    lineHeight: 1.6,
    marginBottom: "40px",
  },
  homeLink: {
    color: "#64748b",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  redirectHint: { fontSize: "0.8rem", color: "#cbd5e1", marginTop: "32px" },
};