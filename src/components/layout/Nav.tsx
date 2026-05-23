"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { LangToggle } from "./LangToggle";
import { cn } from "@/lib/cn";

export function Nav() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#services", label: t("services") },
    { href: "#process", label: t("process") },
    { href: "#cta", label: t("contact") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-[var(--color-deep-ink)]/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto grid h-[72px] max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-10 px-6 sm:px-10 lg:px-14">
        <Link href="/" aria-label="Velox BD" className="flex items-center">
          <Image
            src="/brand/velox-wordmark.png"
            alt="Velox BD"
            width={539}
            height={140}
            priority
            className="h-9 w-auto transition-all duration-300"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-12 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "group relative py-2 text-[15px] font-medium tracking-[-0.01em] transition-colors",
                "text-white/75 hover:text-white",
              )}
            >
              {link.label}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-0.5 left-0 right-0 h-px origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-200 group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <LangToggle onDark={true} />
          <a
            href="#cta"
            className="hidden h-10 items-center justify-center rounded-[8px] bg-[var(--color-accent)] px-5 text-[13px] font-semibold text-[#1a1a1f] transition-colors hover:bg-[var(--color-accent-hover)] sm:inline-flex"
          >
            {t("cta")}
          </a>
        </div>
      </div>
    </header>
  );
}
