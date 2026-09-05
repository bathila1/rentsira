"use client";

import Link from "next/link";
import { useState } from "react";
import { settingsData } from "@/settings";
import SearchModal from "./SearchModal";

/**
 * Site header.
 *
 * Previously this offered only a search button and "Post Free", so there was no
 * link to browse listings or to the request form from anywhere on the site —
 * and the homepage did not render a header at all.
 */
export default function Header() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          {/* Brand */}
          <Link
            href="/"
            className="nav-brand"
            style={{ textDecoration: "none" }}
            aria-label={`${settingsData.WebName} home`}
          >
            {settingsData.LogoTextFirstPart}
            <span>{settingsData.LogoTextLastPart}</span>
          </Link>

          <nav className="nav-links" aria-label="Main">
            <button
              onClick={() => setShowSearch(true)}
              className="btn btn-ghost btn-sm nav-search-btn"
              aria-label="Search vehicles"
            >
              🔍 <span className="nav-search-label">Search</span>
            </button>

            <Link href="/explore" className="nav-link">
              Browse
            </Link>

            {/* Hidden on the narrowest screens, where the bottom bar covers it */}
            <Link href="/book" className="nav-link nav-link-wide">
              Request
            </Link>

            <Link href="/get-started" className="btn btn-primary btn-sm">
              Post Free
            </Link>
          </nav>
        </div>
      </header>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
}
