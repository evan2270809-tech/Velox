"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Fixed header bar. Blends into the page at the top, gets a hairline once the page scrolls. */
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
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-300 bg-paper/80 backdrop-blur-md data-[scrolled=true]:border-line data-[scrolled=true]:bg-paper/90"
    >
      {children}
    </header>
  );
}
