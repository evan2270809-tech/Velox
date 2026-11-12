import type { CSSProperties } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ReplayVideo } from "@/components/ui/ReplayVideo";
import { container } from "@/components/ui/SectionHeader";
import { heroVideo, mailtoHref } from "@/content/site";
import { cn } from "@/lib/cn";

const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * The statement, then the real thing: a replay of a recorded episode in our
 * collection software. The recording starts inside the first screen and runs
 * past its bottom edge, so the page invites a scroll.
 */
export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="pb-20 pt-28 lg:pb-28 lg:pt-40">
      <div className={container}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div className="rise" style={delay(0)}>
            <p className="font-mono text-[13px] leading-5 text-ink-3">{t("chip")}</p>
            <h1 className="display mt-4 text-[clamp(2.5rem,9vw,2.75rem)] sm:text-[3.5rem] lg:text-[4.25rem]">
              {t.rich("headline", { accent: (chunks) => <span className="block">{chunks}</span> })}
            </h1>
          </div>

          <div className="rise" style={delay(80)}>
            <p className="max-w-[36rem] text-[18px] leading-[1.6] text-ink-2">{t("sub")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={mailtoHref} size="lg">
                {t("ctaPrimary")}
                <ArrowRight aria-hidden className="size-[18px]" strokeWidth={1.75} />
              </ButtonLink>
              <ButtonLink href="#building" variant="secondary" size="lg">
                {t("ctaSecondary")}
                <ArrowDown aria-hidden className="size-[18px]" strokeWidth={1.75} />
              </ButtonLink>
            </div>
          </div>
        </div>

        <figure className="rise mt-12 lg:mt-16" style={delay(160)}>
          <ReplayVideo
            video={heroVideo}
            label={t("media.caption")}
            className="rounded-xl border border-line shadow-[0_8px_24px_rgb(31_27_22/0.06)]"
          />
          <figcaption
            className={cn(
              "mt-4 grid gap-1 text-[14px] leading-5",
              "sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6",
            )}
          >
            <span className="flex items-center gap-2 font-medium text-ink">
              {/* Signature: a live dot, like the device status in the Collector UI */}
              <span aria-hidden className="size-2 rounded-full bg-velox-orange" />
              {t("media.caption")}
            </span>
            <span className="text-ink-2">{t("media.detail")}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
