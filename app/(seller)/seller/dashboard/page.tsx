"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    getUserData();
  }, [router]);

  // Logic: The Logout Function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      alert("Error logging out: " + error.message);
    } else {
      // Logic: After signing out, send the user to the home or login page
      router.push("/");
      // Optional: Refresh the page to ensure all states are cleared
      router.refresh();
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Seller Dashboard</h1>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{ 
            backgroundColor: "#ff4d4d", 
            color: "white", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: "5px",
            cursor: "pointer" 
          }}
        >
          Logout
        </button>
      </header>

      <hr />
      
      <section>
        <h2>Welcome, {user.user_metadata?.full_name || "Seller"}!</h2>
        <p>Email: {user.email}</p>
        <p>Phone: {user.user_metadata?.phone}</p>
      </section>

      <div style={{ marginTop: "30px", border: "1px dashed gray", padding: "20px" }}>
        
        {/* Go to uploaded vehicles */}
        <Link href="/seller/vehicles"><button>View Uploaded Vehicles</button></Link>
        <br />
        <hr />
        <Link href="/seller/vehicles/upload"><button>+ Add New Vehicle</button></Link>
      </div>
    </div>
  );
}