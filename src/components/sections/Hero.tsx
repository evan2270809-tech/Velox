import type { CSSProperties } from "react";
import { getImageProps } from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ConceptLabel } from "@/components/ui/ConceptLabel";
import { container } from "@/components/ui/SectionHeader";
import { mailtoHref, sectionImages } from "@/content/site";
import { cn } from "@/lib/cn";

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

export function Hero() {
  const t = useTranslations("hero");

  // Art direction: phones get a portrait crop of the glove, desktops the wide frame.
  const desktop = getImageProps({
    src: sectionImages.heroDesktop,
    alt: "",
    fill: true,
    sizes: "100vw",
  });
  const mobile = getImageProps({
    src: sectionImages.heroMobile,
    alt: "",
    fill: true,
    sizes: "100vw",
    priority: true,
  });

  return (
    <section className="relative isolate overflow-hidden bg-midnight-900 [--hero-image:min(118vw,56svh)] lg:flex lg:min-h-[min(100svh,920px)] lg:items-center">
      {/* Mobile: the image sits below the header and the text follows it.
          Desktop: a 16:9 frame as wide as the viewport, nudged right so the glove
          stays clear of the text column, centred vertically when it is shorter
          than the section and pinned under the header when it is taller. */}
      <div className="absolute inset-x-0 top-16 -z-10 h-[var(--hero-image)] lg:left-auto lg:right-[-6%] lg:top-[max(3.5rem,calc(50%-28.3vw))] lg:aspect-[1920/1086] lg:h-auto lg:w-full">
        <picture>
          <source
            media="(min-width: 1024px)"
            srcSet={desktop.props.srcSet}
            sizes={desktop.props.sizes}
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- <picture> needs a plain <img>; srcset comes from next/image */}
          <img {...mobile.props} alt="" className="object-cover object-top" />
        </picture>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-midnight-900)_0%,transparent_14%,transparent_50%,var(--color-midnight-900)_100%)] lg:bg-[linear-gradient(90deg,var(--color-midnight-900)_0%,rgb(18_15_42/0.85)_28%,rgb(18_15_42/0.35)_46%,transparent_60%),linear-gradient(180deg,var(--color-midnight-900)_0%,transparent_12%,transparent_72%,var(--color-midnight-900)_100%)]"
        />
      </div>
      <ConceptLabel className="absolute right-4 top-20 lg:bottom-8 lg:right-10 lg:top-auto" />

      {/* Blend into the next section */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-midnight-800 lg:h-44"
      />

      <div
        className={cn(
          container,
          "relative pb-16 pt-[calc(4rem+var(--hero-image)-4.5rem)] lg:pb-28 lg:pt-36",
        )}
      >
        <div className="max-w-[640px]">
          <p
            className="rise inline-flex items-center gap-2.5 rounded-full border border-cream-100/15 bg-midnight-800/70 px-3.5 py-1.5 text-[13px] font-medium text-cream-100/90 backdrop-blur"
            style={delay(0)}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-cream-100" />
            {t("chip")}
          </p>

          <h1
            className="display rise mt-6 text-[clamp(2.1rem,9vw,3.1rem)] sm:text-[3.5rem] lg:text-[clamp(3.25rem,5vw,4.5rem)]"
            style={delay(80)}
          >
            {t.rich("headline", {
              accent: (chunks) => <span className="block text-velox-orange">{chunks}</span>,
            })}
          </h1>

          <p
            className="rise mt-6 max-w-[34rem] text-[17px] leading-[1.65] text-cream-100/80 lg:max-w-[30rem] lg:text-[19px]"
            style={delay(180)}
          >
            {t("sub")}
          </p>

          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={delay(280)}>
            <ButtonLink href={mailtoHref} size="lg">
              {t("ctaPrimary")}
              <ArrowRight aria-hidden className="size-[18px]" strokeWidth={2.4} />
            </ButtonLink>
            <ButtonLink href="#building" variant="secondary" size="lg">
              {t("ctaSecondary")}
              <ArrowDown aria-hidden className="size-[18px]" strokeWidth={2.2} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
