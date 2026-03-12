"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";   

// get relavent results from db supabase
const fetchVehicles = () => {
// const fetchVehicles = async() => {
  // Logic:
  return [{"id": "1", "name": "premio", "sellerName": "bathila"}, {"id": "2", "name": "vitz", "sellerName": "nadinsa"}, {"id": "3", "name": "sdsdfsd", "sellerName": "bathila"}];
}

// 1. Create a separate component to handle the search logic
const VehicleListContent = () => {
  const searchParams = useSearchParams();

  // Call hooks inside the body of the function component
  const district = searchParams.get("district");
  const vehicleType = searchParams.get("vehicleType");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  const data = fetchVehicles();

  return (
    <div>
      <h1>Vehicle Results</h1>
      <p>Showing results for:</p>
      <ul>
        <li><strong>District:</strong> {district || "All"}</li>
        <li><strong>Vehicle:</strong> {vehicleType || "All"}</li>
        <li><strong>Location:</strong> {latitude && longitude ? `${latitude}, ${longitude}` : "Not provided"}</li>
      </ul>
      
      {/* This is where your filtered vehicle list would go */}
      <div>
        Result list for {vehicleType} in {district} will appear here.

        {/* mapping results */}
        {data.map((v) => (
            <div key={v["id"]}>
                <hr />
                <p>{v["name"]}</p>
                <p>{v["sellerName"]}</p>
                <Link href={`/vehicles/${v["id"]}`}>View Details</Link>
                <hr />
            </div>
          ))}

      </div>
    </div>
  );
};

// 2. The main Page component must wrap the content in Suspense
export default function VehiclesPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <VehicleListContent />
    </Suspense>
  );
}