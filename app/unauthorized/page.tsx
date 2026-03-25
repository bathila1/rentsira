import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
      <p className="text-red-500 font-bold text-lg tracking-widest uppercase mb-2">403 — Unauthorized</p>
      <h1 className="text-white font-extrabold text-6xl md:text-8xl mb-4">No Access.</h1>
      <p className="text-gray-400 text-lg mb-8">You don't have permission to view this page.<br/>Please log in or go back home.</p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full transition">
          Log In
        </Link>
        <Link href="/" className="border border-white text-white hover:bg-white hover:text-black font-bold px-8 py-3 rounded-full transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}