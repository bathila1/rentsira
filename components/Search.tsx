"use client";

import React, { useState } from "react";

const SriLankanDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const VehicleTypes = ["3 Wheel", "Car", "Van", "Bus", "Lorry", "Motorcycle", "Truck", "Wedding Hire"];

const Search = () => {
  const [district, setDistrict] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState("");

  const handleGetLocation = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!navigator.geolocation) {
      alert("Your browser does not support Geolocation");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        setIsLocating(false);
        setMessage("Location detected successfully!");
      },
      (error) => {
        console.log("Location error:", error.message);
        setIsLocating(false);
        setMessage("Could not get location. Please select district manually.");
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!district) {
      setMessage("Please select a district.");
      return;
    }
    window.location.href = `/vehicles?district=${district}&vehicleType=${vehicleType}&latitude=${latitude}&longitude=${longitude}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Find a Ride Near You</h2>
        
        {message && <p style={{ ...styles.message, color: message.includes("success") ? "#059669" : "#dc2626" }}>{message}</p>}
        {isLocating && <p style={styles.locatingText}>🛰️ Accessing GPS...</p>}

        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>District</label>
            <select 
              style={styles.select} 
              value={district} 
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">Where are you?</option>
              {SriLankanDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Vehicle Type</label>
            <select 
              style={styles.select} 
              value={vehicleType} 
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="">Any Vehicle</option>
              {VehicleTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div style={styles.buttonRow}>
            <button type="button" onClick={handleGetLocation} style={styles.geoButton}>
              {latitude ? "📍 Location Set" : "🎯 Use My Location"}
            </button>
            
            <button type="submit" style={styles.submitButton}>
              Search Vehicles
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Professional Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#00000099",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    width: "100%",
    border: "1px solid #f1f5f9",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "1.5rem",
    color: "#ffffff",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#64748b",
  },
  select: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
    backgroundColor: "#757575",
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "10px",
  },
  geoButton: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #2563eb",
    backgroundColor: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  submitButton: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.4)",
  },
  message: {
    fontSize: "0.85rem",
    textAlign: "center",
    marginBottom: "15px",
    padding: "8px",
    borderRadius: "5px",
    backgroundColor: "#fef2f2",
  },
  locatingText: {
    fontSize: "0.85rem",
    color: "#2563eb",
    textAlign: "center",
    fontStyle: "italic",
  }
};

export default Search;