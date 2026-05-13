"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const [seoulTime, setSeoulTime] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const now = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      });
      setSeoulTime(now);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-white/[0.08] bg-[var(--color-deep-ink)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-5">
            <Link
              href="/"
              className="text-[20px] font-semibold tracking-tight text-white"
            >
              velox<span className="text-[var(--color-accent)]">.</span>
            </Link>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">
              {t("tagline")}
            </p>
            <Link
              href="/#cta"
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              {tNav("cta")}
            </Link>
          </div>

          <div className="md:col-span-3 md:border-l md:border-white/[0.08] md:pl-8">
            <h3 className="font-mono-tight text-[11px] uppercase tracking-[0.18em] text-white/55">
              {t("contact")}
            </h3>
            <ul className="mt-5 space-y-3 text-[14px]">
              <li>
                <a href="#services" className="text-white/75 transition-colors hover:text-white">
                  {tNav("services")}
                </a>
              </li>
              <li>
                <a href="#process" className="text-white/75 transition-colors hover:text-white">
                  {tNav("process")}
                </a>
              </li>
              <li>
                <a href="#cta" className="text-white/75 transition-colors hover:text-white">
                  {tNav("cta")}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 md:border-l md:border-white/[0.08] md:pl-8">
            <h3 className="font-mono-tight text-[11px] uppercase tracking-[0.18em] text-white/55">
              Legal
            </h3>
            <ul className="mt-5 space-y-3 text-[14px]">
              <li>
                <a href="#" className="text-white/75 transition-colors hover:text-white">
                  {t("privacy")}
                </a>
              </li>
              <li>
                <a href="#" className="text-white/75 transition-colors hover:text-white">
                  {t("terms")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-white/[0.08] pt-6 text-[12px] tracking-[0.04em] text-white/55 sm:flex-row sm:items-center">
          <p>{t("rights")}</p>
          <p className="font-mono-tight uppercase tracking-[0.18em]">
            Seoul {seoulTime && <span className="text-white/80">· {seoulTime} KST</span>}
          </p>
        </div>
      </div>
    </footer>
  );
}
