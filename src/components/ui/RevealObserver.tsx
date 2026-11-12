"use client";

import { useEffect } from "react";

/**
 * Turns on the scroll reveal for every `[data-reveal]` element on the page.
 *
 * Anything already on screen (or above it) when the page loads is left as it is,
 * so nothing flashes. Only elements further down start hidden and fade in as
 * they scroll into view. Does nothing when the visitor prefers reduced motion.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const show = (el: Element) => el.setAttribute("data-revealed", "");

    const pending: Element[] = [];
    for (const el of document.querySelectorAll("[data-reveal]")) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el);
      else pending.push(el);
    }

    // From here on, unrevealed elements are hidden (see globals.css).
    root.setAttribute("data-reveal-ready", "");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of pending) observer.observe(el);

    return () => {
      observer.disconnect();
      root.removeAttribute("data-reveal-ready");
    };
  }, []);

  return null;
}
