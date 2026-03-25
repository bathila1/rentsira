import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
      <p className="text-red-500 font-bold text-lg tracking-widest uppercase mb-2">404 — Page Not Found</p>
      <h1 className="text-white font-extrabold text-6xl md:text-8xl mb-4">Wrong Turn.</h1>
      <p className="text-gray-400 text-lg mb-8">Looks like this road doesn't exist.<br/>Let's get you back on track.</p>
      <Link href="/" className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full transition">
        Back to Home
      </Link>
    </div>
  );
}