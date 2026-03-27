"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import BumpModal from "../components/BumpModal";
import { settingsData } from "@/settings";
import OtpVerify from "../profile/components/OtpVerify";
import { formatAndValidateSLNumber } from "@/utils/sanitize";

const PAGE_SIZE = settingsData.vehiclesPerPage || 5;

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [bumpTarget, setBumpTarget] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showOtp, setShowOtp] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (f: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [f]: v }));

  const [form, setForm] = useState({
    phone: "",
  });

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
      setLoadingPage(false);
    }
    init();
  }, []);
useEffect(() => {
  if (user && profile?.is_verified) fetchVehicles(user.id)
}, [user, page, profile?.is_verified])

  async function fetchVehicles(userId: string) {
    setLoadingList(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("uploaded_rent_vehicles")
      .select(
        "id, make, model, type, year, daily_rate, image_urls, view_count, bumped_until, district",
      )
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (!error) {
      setVehicles(data || []);
      setHasMore((data || []).length === PAGE_SIZE);
    }
    setLoadingList(false);
  }

  async function handleDelete(vehicleId: string) {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    setDeletingId(vehicleId);
    const { error } = await supabase
      .from("uploaded_rent_vehicles")
      .delete()
      .eq("id", vehicleId);
    if (error) alert("Error: " + error.message);
    else fetchVehicles(user.id);
    setDeletingId(null);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleBumpSuccess = () => {
    setBumpTarget(null);
    fetchVehicles(user.id);
  };

  const isBumped = (v: any) =>
    v.bumped_until && new Date(v.bumped_until) > new Date();

  const bumpTimeLeft = (v: any) => {
    if (!isBumped(v)) return null;
    const diff = new Date(v.bumped_until).getTime() - Date.now();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Less than 1h left";
    if (hours < 24) return `${hours}h left`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  };

  // ─── Loading screen ───
  if (loadingPage)
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
          <p className="label">Loading dashboard...</p>
        </div>
      </div>
    );

  const avatarLetter =
    profile?.full_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  const isVerified = profile?.is_verified;
  const isUserHaveAPhoneNumber = profile?.phone;

  // if (!isVerified)
  //   return (
  //     <div
  //       className="page"
  //       style={{
  //         display: "grid",
  //         placeItems: "center",
  //         minHeight: "100vh",
  //         padding: "var(--space-6)",
  //       }}
  //     >
  //       <div
  //         className="card animate-fade-in-scale"
  //         style={{
  //           maxWidth: "460px",
  //           width: "100%",
  //           padding: "var(--space-8)",
  //         }}
  //       >
  //         {/* Header */}
  //         <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
  //           <div
  //             style={{
  //               width: "64px",
  //               height: "64px",
  //               borderRadius: "50%",
  //               background: "var(--color-warning-light)",
  //               border: "2px solid var(--color-warning-border)",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               fontSize: "1.8rem",
  //               margin: "0 auto var(--space-4)",
  //             }}
  //           >
  //             😊
  //           </div>
  //           <h2 style={{ fontSize: "1.3rem", marginBottom: "var(--space-2)" }}>
  //             Verify Your Phone Number
  //           </h2>
  //           <p
  //             style={{
  //               fontSize: "0.875rem",
  //               color: "var(--text-tertiary)",
  //               lineHeight: 1.7,
  //               maxWidth: "320px",
  //               margin: "0 auto",
  //             }}
  //           >
  //             You need to verify your account before accessing the Renter
  //             dashboard.
  //           </p>
  //         </div>

  //         {/* ─── Verifying Phone ─── */}
  //         {/* Phone input with flag prefix */}
  //         <div style={{ display: "flex" }}>
  //           <span
  //             style={{
  //               display: "flex",
  //               alignItems: "center",
  //               background: "var(--bg-subtle)",
  //               border: "1.5px solid var(--border-default)",
  //               borderRight: "none",
  //               borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)",
  //               padding: "0 var(--space-3)",
  //               fontSize: "0.85rem",
  //               fontWeight: 600,
  //               color: "var(--text-secondary)",
  //               whiteSpace: "nowrap",
  //               flexShrink: 0,
  //             }}
  //           >
  //             🇱🇰 +94
  //           </span>

  //           <input
  //             value={isUserHaveAPhoneNumber ? profile?.phone : form.phone}
  //             onChange={(e) => set("phone", e.target.value)}
  //             placeholder="77 123 4567"
  //             type="tel"
  //             className="input"
  //             style={{
  //               borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
  //               borderLeft: "none",
  //             }}
  //           />
  //         </div>
  //         {/* Verify button — shows only if phone added but not verified */}
  //         {(formatAndValidateSLNumber(form.phone) || isUserHaveAPhoneNumber)&& !profile?.phone_verified && (
  //           <button
  //             type="button"
  //             onClick={() => setShowOtp(true)}
  //             className="btn btn-primary btn-sm"
  //             style={{ marginTop: "var(--space-2)", width: "100%" }}
  //           >
  //             📱 Verify Phone Number via OTP
  //           </button>
  //         )}

  //         {showOtp && user && (
  //           <div
  //             style={{
  //               position: "fixed",
  //               inset: 0,
  //               zIndex: 100,
  //               background: "rgb(0 0 0 / 0.55)",
  //               backdropFilter: "blur(4px)",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               padding: "var(--space-4)",
  //             }}
  //           >
  //             <OtpVerify
  //               phone={isUserHaveAPhoneNumber ? profile?.phone : form.phone}
  //               userId={user.id}
  //               onSuccess={async () => {
  //                 setShowOtp(false);
  //                 // Refetch profile to get updated verified status
  //                 const { data } = await supabase
  //                   .from("profiles")
  //                   .select("*")
  //                   .eq("id", user.id)
  //                   .single();
  //                 setProfile(data);
  //                 setSaved(true);
  //                 setTimeout(() => setSaved(false), 3000);
  //               }}
  //               onCancel={() => setShowOtp(false)}
  //             />
  //           </div>
  //         )}

  //         {/* ─── Verifying Phone ─── */}
  //         <br />
  //         {/* Logout option */}
  //         <button
  //           onClick={handleLogout}
  //           className="btn btn-ghost btn-full"
  //           style={{ marginTop: "var(--space-8)" }}
  //         >
  //           Logout
  //         </button>
  //       </div>
  //     </div>
  //   );
  if (!isVerified)
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
        {/* OTP Modal — outside the card so it covers full screen */}
        {showOtp && user && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgb(0 0 0 / 0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-4)",
            }}
          >
            <OtpVerify
              isGoogleLogin={isUserHaveAPhoneNumber ? false : true}
              phone={isUserHaveAPhoneNumber ? profile?.phone : form.phone}
              userId={user.id}
              onSuccess={async () => {
                setShowOtp(false);
                const { data } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", user.id)
                  .single();
                setProfile(data);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
              onCancel={() => setShowOtp(false)}
            />
          </div>
        )}

        <div
          className="card animate-fade-in-scale"
          style={{
            maxWidth: "460px",
            width: "100%",
            padding: "var(--space-8)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--color-warning-light)",
                border: "2px solid var(--color-warning-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                margin: "0 auto var(--space-4)",
              }}
            >
              😊
            </div>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "var(--space-2)" }}>
              Verify Your Phone Number
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-tertiary)",
                lineHeight: 1.7,
                maxWidth: "320px",
                margin: "0 auto",
              }}
            >
              You need to verify your account before accessing the Renter
              dashboard.
            </p>
          </div>

          {/* Phone input with flag prefix */}
          <div style={{ display: "flex" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--bg-subtle)",
                border: "1.5px solid var(--border-default)",
                borderRight: "none",
                borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)",
                padding: "0 var(--space-3)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              🇱🇰 +94
            </span>
            <input
              value={isUserHaveAPhoneNumber ? profile?.phone : form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="77 123 4567"
              type="tel"
              className="input"
              style={{
                borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
                borderLeft: "none",
              }}
            />
          </div>

          {/* Verify button */}
          {(formatAndValidateSLNumber(form.phone) || isUserHaveAPhoneNumber) &&
            !profile?.phone_verified && (
              <button
                type="button"
                onClick={() => setShowOtp(true)}
                className="btn btn-primary btn-sm"
                style={{ marginTop: "var(--space-2)", width: "100%" }}
              >
                📱 Verify Phone Number via OTP
              </button>
            )}

          {/* Logout option */}
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-full"
            style={{ marginTop: "var(--space-8)" }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  else
    return (
      <div className="page">
        {/* ─── NAV ─── */}
        <header className="nav">
          <div className="container nav-inner">
            {/* Brand */}
            <Link
              href="/"
              className="nav-brand"
              style={{ textDecoration: "none" }}
            >
              {settingsData.LogoTextFirstPart}
              <span>{settingsData.LogoTextLastPart}</span>
            </Link>

            {/* Right side */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              {/* Profile chip */}
              <Link
                href="/seller/profile/edit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "var(--color-primary-light)",
                    border: "1.5px solid var(--color-primary-border)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {avatarLetter}
                </div>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    display: "var(--hide-on-mobile, inline)",
                  }}
                  className="hide-mobile"
                >
                  {profile?.full_name || "Profile"}
                </span>
              </Link>

              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main
          className="container"
          style={{ padding: "var(--space-2) var(--space-4)" }}
        >
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: "var(--space-2)", display: "inline-flex" }}
          >
            {"←"} Back to Home
          </Link>
          {/* ─── PROFILE CARD ─── */}
          <div
            className="card card-p"
            style={{
              marginBottom: "var(--space-6)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--neutral-950)",
                  color: "var(--neutral-0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  flexShrink: 0,
                }}
              >
                {avatarLetter}
              </div>
              <div>
                <p className="label" style={{ marginBottom: "2px" }}>
                  Renter Account
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {profile?.full_name || "Your Name"}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-tertiary)",
                    marginTop: "2px",
                  }}
                >
                  {user?.email}
                  {profile?.phone && (
                    <span style={{ marginLeft: "var(--space-3)" }}>
                      📞 {profile.phone}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-2)",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/seller/profile/edit"
                className="btn btn-secondary btn-sm"
              >
                ✏️ Edit Profile
              </Link>
              <Link
                href="/seller/vehicles/upload"
                className="btn btn-primary btn-sm"
              >
                + Add Vehicle
              </Link>
            </div>
          </div>

          {/* ─── LIST HEADER ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem" }}>Your Listings</h2>
            {loadingList && (
              <span className="label" style={{ color: "var(--color-primary)" }}>
                Refreshing...
              </span>
            )}
          </div>

          {/* ─── EMPTY STATE ─── */}
          {vehicles.length === 0 && !loadingList ? (
            <div className="empty-state">
              <span className="empty-state-icon">🚘</span>
              <p className="empty-state-title">No vehicles listed yet</p>
              <p className="empty-state-sub">
                Add your first vehicle to start renting
              </p>
              <Link href="/seller/vehicles/upload" className="btn btn-primary">
                + Add a Vehicle
              </Link>
            </div>
          ) : (
            // ─── VEHICLE LIST ───
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="card"
                  style={{
                    overflow: "hidden",
                    borderColor: isBumped(v)
                      ? "var(--red-300)"
                      : "var(--border-default)",
                    boxShadow: isBumped(v)
                      ? "0 0 0 1px var(--red-200), var(--shadow-md)"
                      : "var(--shadow-xs)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-4)",
                      padding: "var(--space-4)",
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        width: "90px",
                        height: "75px",
                        flexShrink: 0,
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                        background: "var(--bg-subtle)",
                      }}
                    >
                      {v.image_urls?.[0] ? (
                        <img
                          src={v.image_urls[0]}
                          alt={v.model}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            color: "var(--neutral-300)",
                          }}
                        >
                          🚗
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Top row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "var(--space-2)",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          {/* Bumped badge */}
                          {isBumped(v) && (
                            <div style={{ marginBottom: "4px" }}>
                              <span className="badge badge-red">
                                🔥 Bumped — {bumpTimeLeft(v)}
                              </span>
                            </div>
                          )}
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {v.make} {v.model}{" "}
                            <span
                              style={{
                                fontWeight: 400,
                                color: "var(--text-tertiary)",
                                fontSize: "0.85rem",
                              }}
                            >
                              ({v.year})
                            </span>
                          </p>
                          <p
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-tertiary)",
                              marginTop: "2px",
                            }}
                          >
                            {v.type} • 📍 {v.district}
                          </p>
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p className="vehicle-card-price">
                            Rs. {v.daily_rate?.toLocaleString()}
                            <span>/day</span>
                          </p>
                          {/* <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-tertiary)",
                              marginTop: "2px",
                            }}
                          >
                            👁️ {v.view_count || 0} views
                          </p> */}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "var(--space-2)",
                          marginTop: "var(--space-3)",
                        }}
                      >
                        <Link
                          href={`/explore/${v.id}?sellerView=true`}
                          className="btn btn-secondary btn-sm"
                        >
                          👁️ View
                        </Link>

                        <Link
                          href={`/seller/vehicles/edit/${v.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          ✏️ Edit
                        </Link>

                        {/* Bump */}
                        <button
                          onClick={() => setBumpTarget(v)}
                          className="btn btn-sm"
                          style={{
                            background: isBumped(v)
                              ? "var(--red-50)"
                              : "var(--color-primary-light)",
                            color: "var(--color-primary)",
                            border: "1px solid var(--color-primary-border)",
                          }}
                        >
                          🔥 {isBumped(v) ? "Extend Bump" : "Bump Up"}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="btn btn-danger btn-sm"
                        >
                          {deletingId === v.id ? "⏳" : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── PAGINATION ─── */}
          {(page > 0 || hasMore) && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="pagination-btn"
              >
                {"←"} Prev
              </button>
              <span className="pagination-btn active">{page + 1}</span>
              <button
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
                className="pagination-btn"
              >
                Next {"→"}
              </button>
            </div>
          )}
        </main>

        {/* ─── BUMP MODAL ─── */}
        {bumpTarget && (
          <BumpModal
            vehicle={bumpTarget}
            onClose={() => setBumpTarget(null)}
            onSuccess={handleBumpSuccess}
          />
        )}
      </div>
    );
}
