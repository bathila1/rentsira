"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const VehicleListContent = () => {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Get query params from the URL
  const district = searchParams.get("district");
  const vehicleType = searchParams.get("vehicleType");
  const latParam = searchParams.get("latitude");
  const lonParam = searchParams.get("longitude");

  useEffect(() => {
    const getVehicles = async () => {
      setLoading(true);

      // Convert lat/lon strings to numbers
      const lat = latParam ? parseFloat(latParam) : 0;
      const lon = lonParam ? parseFloat(lonParam) : 0;

      // 2. Call the SQL Function (RPC) we created in Supabase
      // This calculates distance and filters at the same time
      const { data, error } = await supabase.rpc("get_nearby_vehicles", {
        user_lat: lat,
        user_lon: lon,
        search_district: district === "" ? null : district,
        search_type: vehicleType === "" ? null : vehicleType,
      });

      if (error) {
        console.error("Proximity Search Error:", error);
      } else {
        setVehicles(data || []);
      }
      
      setLoading(false);
    };

    getVehicles();
  }, [searchParams, supabase]);

  if (loading) return <p style={{ padding: "20px" }}>Finding closest vehicles...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>Search Results</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Found {vehicles.length} vehicles matching your criteria.
      </p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {vehicles.map((v) => (
          <div key={v.id} style={cardStyle}>
            {/* Display the first image from the array */}
            <img 
              src={v.image_urls?.[0] || "https://via.placeholder.com/300x200"} 
              alt={v.model} 
              style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }} 
            />
            
            <h3 style={{ margin: "15px 0 5px 0" }}>{v.make} {v.model}</h3>
            
            {/* 3. Display the calculated distance */}
            <p style={{ color: "#059669", fontWeight: "bold", margin: "5px 0" }}>
               📍 {v.dist_meters ? (v.dist_meters / 1000).toFixed(2) : "0.00"} km away
            </p>
            
            <p style={{ margin: "5px 0" }}>District: {v.district}</p>
            <p style={{ fontWeight: "600" }}>Rate: Rs. {v.daily_rate?.toLocaleString()}/day</p>
            
            <Link href={`/vehicles/${v.id}`} style={linkStyle}>
              View Details
            </Link>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No vehicles found. Try changing your filters.</p>
          <Link href="/" style={{ color: "#2563eb" }}>Go back to search</Link>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  padding: "20px",
  borderRadius: "16px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const linkStyle = {
  display: "inline-block",
  marginTop: "15px",
  padding: "10px 20px",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "bold",
  textDecoration: "none",
  borderRadius: "8px",
  textAlign: "center" as const,
};

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <VehicleListContent />
    </Suspense>
  );
}