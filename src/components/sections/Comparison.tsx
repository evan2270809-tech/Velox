"use client";

import { useTranslations } from "next-intl";
import { Check, X, ArrowRight } from "lucide-react";
import { SectionHeading, emRenderer } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";

interface Pair {
  before: string;
  after: string;
}

export function Comparison() {
  const t = useTranslations("compare");
  const pairs = t.raw("pairs") as Pair[];

  return (
    <section className="relative overflow-hidden bg-[var(--color-deep-ink)] py-28 lg:py-36">
      {/* Ambient glows for atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 -z-10 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(82,82,91,0.18) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-20 -z-10 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(242,160,58,0.16) 0%, rgba(242,160,58,0.04) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Faint dot grid artifact */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t.rich("title", { em: emRenderer("dark") })}
            lede={t("lede")}
            align="center"
            tone="dark"
            className="items-center text-center"
          />
        </Reveal>

        {/* Column headers */}
        <Reveal delay={0.1}>
          <div className="mt-14 hidden grid-cols-[1fr_auto_1fr] items-end gap-6 lg:grid">
            <div className="flex flex-col items-start gap-2">
              <span
                className="text-[11px] uppercase text-white/40"
                style={{ letterSpacing: "0.22em" }}
              >
                {t("beforeLabel")}
              </span>
              <span className="h-px w-full bg-white/15" />
            </div>
            <ArrowRight
              className="size-5 -translate-y-1 text-[var(--color-accent)]"
              strokeWidth={2}
              aria-hidden
            />
            <div className="flex flex-col items-start gap-2">
              <span
                className="text-[11px] uppercase text-[var(--color-accent)]"
                style={{ letterSpacing: "0.22em" }}
              >
                {t("afterLabel")}
              </span>
              <span className="h-px w-full bg-[var(--color-accent)]/40" />
            </div>
          </div>
        </Reveal>

        <RevealStagger
          as="ul"
          step={0.08}
          margin="-40px"
          className="mt-8 flex flex-col gap-4 lg:mt-10"
        >
          {pairs.map((p, i) => (
            <RevealItem
              key={i}
              as="li"
              className="group grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]"
            >
              {/* BEFORE — dim card */}
              <div
                className="flex items-start gap-4 rounded-[10px] border border-white/[0.07] bg-white/[0.025] p-5 transition-colors lg:p-6"
                style={{ wordBreak: "keep-all" }}
              >
                <span
                  aria-hidden
                  className="mt-[3px] inline-flex size-6 flex-none items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.45)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                >
                  <X className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-[15px] leading-[1.55] text-white/55">
                  {p.before}
                </span>
              </div>

              {/* Transformation arrow — desktop only */}
              <div
                aria-hidden
                className="hidden items-center justify-center lg:flex"
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className="block h-px w-12 bg-gradient-to-r from-white/10 via-[var(--color-accent)]/60 to-[var(--color-accent)]"
                  />
                  <ArrowRight
                    className="absolute right-0 size-4 text-[var(--color-accent)]"
                    strokeWidth={2.4}
                  />
                </div>
              </div>

              {/* AFTER — highlighted card */}
              <div
                className="relative flex items-start gap-4 overflow-hidden rounded-[10px] p-5 transition-colors lg:p-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(242,160,58,0.13) 0%, rgba(242,160,58,0.05) 100%)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(242,160,58,0.30), 0 8px 28px -12px rgba(242,160,58,0.18)",
                  wordBreak: "keep-all",
                }}
              >
                {/* Soft inner glow */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full opacity-50"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(242,160,58,0.35) 0%, transparent 65%)",
                    filter: "blur(14px)",
                  }}
                />
                <span
                  aria-hidden
                  className="relative mt-[3px] inline-flex size-6 flex-none items-center justify-center rounded-full"
                  style={{
                    background: "rgba(242,160,58,0.20)",
                    color: "var(--color-accent)",
                    boxShadow: "inset 0 0 0 1px rgba(242,160,58,0.45)",
                  }}
                >
                  <Check className="size-3.5" strokeWidth={2.6} />
                </span>
                <span className="relative text-[15px] font-medium leading-[1.55] text-white">
                  {p.after}
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
