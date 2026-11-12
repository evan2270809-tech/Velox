"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const EMAIL = "contact@veloxbd.com";

export function FinalCTA() {
  const t = useTranslations("finalCta");

  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-[var(--color-deep-ink)] py-28 lg:py-36"
    >
      {/* subtle ambient orange glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px]"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 100%, rgba(242,160,58,0.16) 0%, rgba(242,160,58,0.04) 35%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1.05, 0.36, 1] }}
          className="font-display text-[clamp(34px,4.6vw,52px)] leading-[1.1] tracking-[-0.02em] text-white"
          style={{ fontWeight: 700 }}
        >
          {t("title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1.05, 0.36, 1] }}
          className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.7] text-white/70"
        >
          {t("lede")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1.05, 0.36, 1] }}
          className="mt-10 flex items-center justify-center"
        >
          <a
            href={`mailto:${EMAIL}?subject=Velox%20BD%20-%20Chat`}
            className="group inline-flex h-14 items-center gap-3 rounded-[10px] bg-[var(--color-accent)] px-10 text-[16px] font-semibold text-[#1a1a1f] shadow-[0_10px_30px_-10px_rgba(242,160,58,0.55)] transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-[0_14px_40px_-10px_rgba(242,160,58,0.7)]"
          >
            {t("ctaPrimary")}
            <ArrowRight className="size-[22px] transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
