"use client"; // This line tells Next.js this is a Client Component

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="btn btn-ghost btn-sm"
      style={{ marginBottom: "var(--space-6)", display: "inline-flex" }}
    >
      {"←"} Back
    </button>
  );
}