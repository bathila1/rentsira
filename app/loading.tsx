// app/loading.tsx
import Image from "next/image";

export default function Loading() {
  return (
    <div className="professional-loader-container animate-fade-in-slow">
      {/* 1. Center Branded Logo */}
      <div className="loader-logo-wrapper">
        <Image 
          src="/logo1.jpg" // Your logo file
          alt="SIRAA Logo"
          width={160} // Adjust size as needed
          height={160} // Adjust size as needed
          className="animate-pulse-slow" // Subtle pulse
          priority // Load this image instantly
        />
      </div>

      {/* 2. Professional "Linear" Loader instead of a spinner */}
      <div className="loader-bar-container">
        <div className="loader-bar-progress"></div>
      </div>

      {/* <p className="loader-text">Loading SIRAA...</p> */}
    </div>
  );
}