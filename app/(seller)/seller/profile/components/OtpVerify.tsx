"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase";

export default function OtpVerify({
  phone,
  userId,
  isGoogleLogin,
  onSuccess,
  onCancel,
}: {
  phone: string;
  userId: string;
  isGoogleLogin: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send OTP when component mounts (one time)
  const hasSent = useRef(false);
  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;
    sendOtp();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendOtp = async () => {
    setSending(true);
    setError("");
    try {
      // ─── Check session first ───
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone, user_id: userId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setSent(true);
      setCountdown(120);
      // Focus first input after SMS sent
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSending(false);
      //upload phone number if phone number is not uploaded(google login)
      if (isGoogleLogin) {
        //should upload the phone
        const { error } = await supabase.from("profiles").upsert({
          id: userId,
          phone,
          phone_verified: true,
          phone_verified_at: new Date().toISOString(),
        });
        if (error) {
          setError(error.message);
        } else {
          onSuccess();
        }
      }
    }
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto focus next box
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    // Auto submit when all 6 filled
    if (newOtp.every((d) => d) && newOtp.join("").length === 6) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      verifyOtp(pasted);
    }
  };

  const verifyOtp = async (code: string) => {
    setVerifying(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { otp_code: code, user_id: userId, phone },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Invalid code");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      // verified successfull

      setVerifying(false);
    }
  };

  return (
    <div
      className="card animate-fade-in-scale"
      style={{
        maxWidth: "380px",
        width: "100%",
        padding: "var(--space-8)",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "var(--color-primary-light)",
          border: "2px solid var(--color-primary-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          margin: "0 auto var(--space-4)",
        }}
      >
        📱
      </div>

      {/* Title */}
      <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--space-2)" }}>
        Verify Your Phone
      </h2>

      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-tertiary)",
          lineHeight: 1.7,
          marginBottom: "var(--space-6)",
        }}
      >
        {sending ? (
          "⏳ Sending code..."
        ) : sent ? (
          <>
            We sent a 6-digit code to
            <br />
            <strong style={{ color: "var(--text-primary)" }}>{phone}</strong>
          </>
        ) : (
          "Preparing your code..."
        )}
      </p>

      {/* Error */}
      {error && (
        <div
          className="alert alert-error"
          style={{
            marginBottom: "var(--space-4)",
            textAlign: "left",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* ─── OTP Boxes ─── */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          justifyContent: "center",
          marginBottom: "var(--space-5)",
        }}
      >
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={verifying || sending}
            style={{
              width: "44px",
              height: "52px",
              textAlign: "center",
              fontSize: "1.4rem",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              border: digit
                ? "2px solid var(--color-primary)"
                : "2px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              background: digit
                ? "var(--color-primary-light)"
                : "var(--bg-subtle)",
              color: "var(--text-primary)",
              outline: "none",
              transition: "var(--transition-fast)",
              opacity: verifying || sending ? 0.6 : 1,
              cursor: verifying || sending ? "not-allowed" : "text",
            }}
          />
        ))}
      </div>

      {/* Verifying spinner */}
      {verifying && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: "2px solid var(--red-100)",
              borderTopColor: "var(--color-primary)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontSize: "0.83rem", color: "var(--text-tertiary)" }}>
            Verifying...
          </span>
        </div>
      )}

      {/* Resend */}
      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--text-tertiary)",
          marginBottom: "var(--space-5)",
        }}
      >
        Didn't receive it?{" "}
        {countdown > 0 ? (
          <span>
            Resend in <strong>{countdown}s</strong>
          </span>
        ) : (
          <button
            onClick={sendOtp}
            disabled={sending}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.8rem",
              fontFamily: "var(--font-body)",
              textDecoration: "underline",
            }}
          >
            {sending ? "Sending..." : "Resend Code"}
          </button>
        )}
      </p>

      {/* Cancel */}
      <button onClick={onCancel} className="btn btn-ghost btn-full btn-sm">
        Cancel
      </button>
    </div>
  );
}
