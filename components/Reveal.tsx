"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals its children when they scroll into view.
 *
 * Uses IntersectionObserver rather than a scroll listener, so nothing runs on
 * the main thread between intersections, and animates only `opacity` and
 * `transform` — the two properties the compositor can handle without a repaint.
 * That keeps it smooth on the low-end Android phones most of this traffic is on.
 *
 * The reduced-motion rule in globals.css collapses the transition for anyone
 * who has asked for less movement; the content still ends up visible because
 * the observer always adds the `is-visible` class.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** Stagger, in milliseconds. */
  delay?: number;
  as?: "div" | "section" | "li";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser is too old for IntersectionObserver, just show it.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            // One-shot: never animate the same block twice.
            observer.unobserve(entry.target);
          }
        }
      },
      // Start slightly before the element reaches the fold so the motion has
      // finished by the time it is properly on screen.
      { rootMargin: "0px 0px -80px 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
