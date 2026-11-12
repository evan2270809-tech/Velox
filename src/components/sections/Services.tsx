"use client";

import { useTranslations } from "next-intl";
import { SectionHeading, emRenderer } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { ServiceFeatureCard } from "./shared/ServiceFeatureCard";
import {
  AutomationFlow,
  CostReduction,
  AXRoadmap,
} from "./shared/ServiceVisuals";
import { services } from "@/content/services";

interface Item {
  title: string;
  description: string;
  bullets: string[];
}

const VISUALS = [
  <AutomationFlow key="auto" />,
  <CostReduction key="cost" />,
  <AXRoadmap key="ax" />,
];

export function Services() {
  const t = useTranslations("services");
  const items = t.raw("items") as Item[];

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[var(--color-deep-ink)] py-28 lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 -z-10 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(242,160,58,0.18) 0%, rgba(242,160,58,0.04) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t.rich("title", { em: emRenderer("dark") })}
            lede={t("lede")}
            tone="dark"
          />
        </Reveal>

        <RevealStagger as="ul" className="mt-14 flex flex-col gap-6">
          {items.map((item, i) => (
            <RevealItem key={item.title} as="li">
              <ServiceFeatureCard
                icon={services[i].icon}
                title={item.title}
                description={item.description}
                bullets={item.bullets}
                visual={VISUALS[i]}
                index={i}
                reverse={i % 2 === 1}
              />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
