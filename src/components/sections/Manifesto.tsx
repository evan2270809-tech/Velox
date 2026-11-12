"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Manifesto() {
  const t = useTranslations("manifesto");

  return (
    <section className="relative overflow-hidden border-t border-[var(--color-divider)] bg-white py-28 lg:py-36">
      {/* Subtle off-center orange wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 -z-10 h-[480px] w-[480px] -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(242,160,58,0.10) 0%, rgba(242,160,58,0.03) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1.05, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <span aria-hidden className="h-px w-7 bg-[var(--color-accent)]" />
          <span
            className="text-[11px] font-medium uppercase text-[var(--color-accent-press)]"
            style={{ letterSpacing: "0.16em" }}
          >
            {t("eyebrow")}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1.05, 0.36, 1] }}
          className="font-display mt-6 max-w-[24ch] text-[clamp(34px,5vw,60px)] leading-[1.08] tracking-[-0.025em] text-[var(--color-starlight)]"
          style={{ fontWeight: 700 }}
        >
          {t.rich("line", {
            em: (chunks) => (
              <span className="text-[var(--color-accent-press)]">
                {chunks}
              </span>
            ),
          })}
        </motion.p>
      </div>
    </section>
  );
}
