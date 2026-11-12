"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Fixed header bar. Transparent over the hero, solid once the page scrolls. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled}
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-300 data-[scrolled=true]:border-midnight-600/50 data-[scrolled=true]:bg-midnight-900/90 data-[scrolled=true]:backdrop-blur-md"
    >
      {children}
    </header>
  );
}
