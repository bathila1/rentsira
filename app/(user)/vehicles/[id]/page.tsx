import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Logic: Fetch all data including new fields and the seller profile
  const { data: vehicle, error } = await supabase
    .from("uploaded_rent_vehicles")
    .select(
      `
      *,
      profiles:seller_id (
        full_name,
        phone
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !vehicle) {
    console.error("Fetch error:", error);
    return notFound();
  }

  const profile = vehicle.profiles;

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "5px", textTransform: "uppercase" }}>
        {vehicle.make} {vehicle.model}
      </h1>
      <p style={{ color: "#666", fontSize: "1.2rem", marginTop: "0" }}>
        {vehicle.year} | {vehicle.fuel_type} | {vehicle.type}
      </p>
      
      <hr />

      {/* 4 Image Gallery */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "30px" }}>
        {vehicle.image_urls?.map((url: string, index: number) => (
          <img
            key={index}
            src={url}
            alt={`Vehicle ${index + 1}`}
            style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "12px", border: "1px solid #ddd" }}
          />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Pricing Details */}
        <div style={{ padding: "20px", backgroundColor: "#000000", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ marginTop: 0 }}>Rental Rates</h3>
          <p><strong>Daily:</strong> Rs. {vehicle.daily_rate?.toLocaleString()}</p>
          {vehicle.weekly_rate && <p><strong>Weekly:</strong> Rs. {vehicle.weekly_rate?.toLocaleString()}</p>}
          {vehicle.monthly_rate && <p><strong>Monthly:</strong> Rs. {vehicle.monthly_rate?.toLocaleString()}</p>}
          <p><strong>Driver Included:</strong> {vehicle.with_driver ? "✅ Yes" : "❌ No (Self-Drive)"}</p>
        </div>

        {/* Seller Details */}
        <div style={{ padding: "20px", backgroundColor: "#000000", borderRadius: "12px", border: "1px solid #dbeafe" }}>
          <h3 style={{ marginTop: 0 }}>Seller Contact</h3>
          {profile ? (
            <>
              <p><strong>Name:</strong> {profile.full_name}</p>
              <p><strong>Phone:</strong> {profile.phone}</p>
              <a 
                href={`tel:${profile.phone}`} 
                style={{ 
                  display: "inline-block", 
                  marginTop: "10px", 
                  padding: "10px 20px", 
                  backgroundColor: "#2563eb", 
                  color: "white", 
                  textDecoration: "none", 
                  borderRadius: "6px",
                  fontWeight: "bold"
                }}
              >
                Call Seller
              </a>
            </>
          ) : (
            <p>Seller details not found.</p>
          )}
        </div>
      </div>

      <br />
      <hr />
      <a href="/seller/dashboard" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>
        ← Back to Dashboard
      </a>
    </div>
  );
}