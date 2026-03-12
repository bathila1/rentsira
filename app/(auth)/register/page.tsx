"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  // Status states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

    
  const router = useRouter();

  async function signUpNewUser() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      
      options: {
        // Logic: Save the name into user_metadata so you can show it later
        data: {
          full_name: name,
          phone: phone
        },
      },
    });

    // ... inside your signUpNewUser function
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage(
        "Registration successful! You can now log in to your account.",
      );

      setTimeout(() => {
        router.push("/seller/dashboard?registered"); 
      }, 1500);
    }

    setLoading(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    signUpNewUser();
  };

  return (
    <div>
      <h1>Seller Registration</h1>

      {/* Show message to the user */}
      {message && (
        <p style={{ color: message.includes("Error") ? "red" : "green" }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <label htmlFor="phone">Phone Number:</label>
        <input
          type="text"
          id="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <br />
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
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
