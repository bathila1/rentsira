"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

const ViewUploadedVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination settings
  const PAGE_SIZE = Number(
    process.env.NEXT_PUBLIC_PAGINATION_PAGE_COUNT_SELLER_UPLOADED!,
  );
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchVehicles();
  }, [page]); // Re-fetch when the page changes

  async function fetchVehicles() {
    setLoading(true);

    // 1. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 2. Fetch with filters and range (Pagination)
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("uploaded_rent_vehicles")
        .select("*")
        .eq("seller_id", user.id) // Only get my vehicles
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error) {
        console.log(data);
        setVehicles(data);
      }
    }
    setLoading(false);
  }

  if (loading && vehicles.length === 0) return <p>Loading your vehicles...</p>;

  return (
    <div>
      <h1>My Uploaded Vehicles</h1>

      {vehicles.length === 0 ? (
        <p>
          No vehicles found.{" "}
          <Link href="/seller/vehicles/upload">Upload one now!</Link>
        </p>
      ) : (
        <ul>
          {vehicles.map((item) => (
            <li key={item.id}>
              <strong>
                {item.make} {item.model}
              </strong>{" "}
              ({item.year}) - {item.type}
              <br />
              <Link href={`/vehicles/${item.id}`}>View Details</Link>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        {!loading && (
          <button
            disabled={vehicles.length < PAGE_SIZE}
            onClick={() => {
              setPage(page + 1);
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewUploadedVehiclesPage;
