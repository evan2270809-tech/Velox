"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroCanvas } from "@/components/visuals/HeroCanvas";

const EMAIL = "contact@veloxbd.com";

export function Hero() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollY } = useScroll();
  const groupOpacity = useTransform(scrollY, [0, 480], [1, 0.15]);
  const groupY = useTransform(scrollY, [0, 480], [0, -50]);
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const bgY = useTransform(scrollY, [0, 600], [0, 60]);

  return (
    <section
      className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-[#0a0a0e]"
    >
      {/* Full-bleed hero-ai painterly background, slowly parallaxing */}
      <motion.div
        aria-hidden
        style={{ scale: bgScale, y: bgY }}
        className="pointer-events-none absolute inset-0 -z-30"
      >
        <Image
          src="/brand/hero-ai.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
      </motion.div>

      {/* Live canvas particle network overlaid for motion + mouse reactivity */}
      <div className="pointer-events-auto absolute inset-0 -z-20 mix-blend-screen">
        <HeroCanvas />
      </div>

      {/* Darkening + vignette gradient so text is always legible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 70% at 30% 50%, rgba(10,10,14,0.55) 0%, rgba(10,10,14,0.78) 60%, rgba(10,10,14,0.92) 100%)",
        }}
      />
      {/* Soft bottom fade into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(15,15,18,0.0) 30%, var(--color-abyss) 100%)",
        }}
      />

      <div
        ref={ref}
        className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start gap-7 px-6 py-32 sm:px-10 lg:px-14 lg:py-40"
      >
        <motion.div
          style={{ opacity: groupOpacity, y: groupY }}
          className="flex max-w-[800px] flex-col items-start gap-7"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1.05, 0.36, 1] }}
          >
            <Image
              src="/brand/velox-wordmark.png"
              alt="Velox BD"
              width={539}
              height={140}
              priority
              className="h-16 w-auto md:h-20 lg:h-24"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1.05, 0.36, 1] }}
            className="font-display max-w-[14em] text-[clamp(34px,5.2vw,68px)] leading-[1.08] tracking-[-0.022em] text-white"
            style={{
              fontWeight: 700,
              wordBreak: "keep-all",
              textWrap: "balance",
              textShadow: "0 2px 30px rgba(0,0,0,0.45)",
            }}
          >
            {t.rich("headline", {
              accent: (chunks) => (
                <span className="text-[var(--color-accent)]">{chunks}</span>
              ),
              br: () => <br />,
            })}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1.05, 0.36, 1] }}
            className="max-w-[58ch] text-[17px] md:text-[18px]"
            style={{
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.7,
              wordBreak: "keep-all",
            }}
          >
            {t("sub")}
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1.05, 0.36, 1] }}
            href={`mailto:${EMAIL}?subject=Velox%20BD%20-%20Chat`}
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-[10px] bg-[var(--color-accent)] px-10 text-[16px] font-semibold text-[#1a1a1f] shadow-[0_10px_30px_-10px_rgba(242,160,58,0.55)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-[0_14px_40px_-10px_rgba(242,160,58,0.7)]"
          >
            {t("ctaPrimary")}
            <ArrowRight className="size-[22px] transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
