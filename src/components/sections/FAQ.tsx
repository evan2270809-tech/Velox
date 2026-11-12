"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { SectionHeading, emRenderer } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

interface Item {
  q: string;
  a: string;
}

export function FAQ() {
  const t = useTranslations("faq");
  const items = t.raw("items") as Item[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-[var(--color-divider)] bg-white py-28 lg:py-36">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t.rich("title", { em: emRenderer("light") })}
            align="center"
            className="items-center text-center"
          />
        </Reveal>

        <RevealStagger as="ul" step={0.06} className="mt-10 flex flex-col">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <RevealItem
                key={item.q}
                as="li"
                className="group relative border-b border-[var(--color-divider)] last:border-b-0"
              >
                {/* Hover hairline indicator on left edge */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute bottom-0 left-0 top-0 w-px origin-top scale-y-0 bg-[var(--color-accent)] transition-transform duration-200",
                    "group-hover:scale-y-100",
                    isOpen && "scale-y-100",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-7 pl-4 pr-2 text-left transition-colors hover:bg-[var(--color-abyss)]"
                >
                  <span
                    className="font-display text-[18px] text-[var(--color-starlight)] md:text-[20px]"
                    style={{ fontWeight: 600 }}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 transition-transform duration-300",
                      isOpen
                        ? "rotate-180 text-[var(--color-accent-press)]"
                        : "text-[var(--color-silver)]",
                    )}
                    strokeWidth={1.75}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pl-4 pr-8 text-[15px] leading-relaxed text-[var(--color-silver)]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
