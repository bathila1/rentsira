"use client";
import { useState } from "react";
// Logic Fix: You MUST import supabase for it to work
import { supabase } from "@/utils/supabase"; 
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage("Login failed: " + error.message);
      setLoading(false);
    } else {
      setMessage("Login successful! Redirecting...");
      // Logic: Send user to their dashboard after successful login
      router.push("/seller/dashboard?loggedin"); 
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    signInWithEmail();
  };

  return (
    <div>
      <h1>Login Page</h1>
      
      {/* Show error or success messages */}
      {message && <p style={{ color: message.includes("failed") ? "red" : "green" }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;