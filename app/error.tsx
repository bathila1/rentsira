"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
      <p className="text-red-500 font-bold text-lg tracking-widest uppercase mb-2">500 — Something Went Wrong</p>
      <h1 className="text-white font-extrabold text-6xl md:text-8xl mb-4">Engine Failure.</h1>
      <p className="text-gray-400 text-lg mb-8">Our engine stalled. We're working on it.<br/>Try again or head back home.</p>
      <div className="flex gap-4">
        <button onClick={reset} className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full transition">
          Try Again
        </button>
        <a href="/" className="border border-white text-white hover:bg-white hover:text-black font-bold px-8 py-3 rounded-full transition">
          Back to Home
        </a>
      </div>
    </div>
  );
}