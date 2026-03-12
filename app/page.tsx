import React from "react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Search from "@/components/Search";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  
  // 1. Setup Pagination Variables
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const itemsPerPage = 3; // Change this to 10 or 20 later if you want
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. Fetch data with Range (Pagination) and Count
  const { data: vehicles, error, count } = await supabase
    .from("uploaded_rent_vehicles")
    .select("*", { count: "exact" }) // count: exact tells us total cars in DB
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return <div style={{ padding: "20px" }}>Error: {error.message}</div>;

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <Header/>
      <Search/>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#1e293b", margin: 0 }}>Rental Gallery</h1>
        <p style={{ color: "#64748b" }}>Showing {from + 1} - {Math.min(to + 1, count || 0)} of {count} vehicles</p>
      </header>

      {/* Grid of Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "25px",
        marginBottom: "40px"
      }}>
        {vehicles?.map((car) => (
          <Link key={car.id} href={`/vehicles/${car.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ 
              border: "1px solid #e2e8f0", 
              borderRadius: "15px", 
              overflow: "hidden", 
              backgroundColor: "white",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }}>
              <img 
                src={car.image_urls?.[0] || "/placeholder-car.jpg"} 
                alt={car.model} 
                style={{ width: "100%", height: "200px", objectFit: "cover" }} 
              />
              <div style={{ padding: "15px" }}>
                <h3 style={{ margin: "0", textTransform: "uppercase" }}>{car.make} {car.model}</h3>
                <p style={{ color: "#2563eb", fontWeight: "bold", fontSize: "1.2rem", margin: "10px 0" }}>
                   Rs. {car.daily_rate?.toLocaleString()} <span style={{fontSize: '0.8rem', color: '#666'}}>/day</span>
                </p>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {car.type} • {car.fuel_type} • {car.year}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 3. Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
          {/* Previous Button */}
          <Link 
            href={`/?page=${currentPage - 1}`}
            style={{ 
              padding: "10px 20px", 
              border: "1px solid #ddd", 
              borderRadius: "8px",
              pointerEvents: currentPage <= 1 ? "none" : "auto",
              opacity: currentPage <= 1 ? 0.5 : 1,
              textDecoration: "none",
              color: "white"
            }}
          >
            Previous
          </Link>

          {/* Page Numbers */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            Page <strong>{currentPage}</strong> of {totalPages}
          </div>

          {/* Next Button */}
          <Link 
            href={`/?page=${currentPage + 1}`}
            style={{ 
              padding: "10px 20px", 
              border: "1px solid #ddd", 
              borderRadius: "8px",
              pointerEvents: currentPage >= totalPages ? "none" : "auto",
              opacity: currentPage >= totalPages ? 0.5 : 1,
              textDecoration: "none",
              color: "white "
            }}
          >
            Next
          </Link>
        </div>
      )}
      <br/>
      <Footer/>
    </div>
  );
}