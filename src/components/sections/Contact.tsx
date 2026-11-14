import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { container, sectionFrame } from "@/components/ui/SectionHeader";
import { mailtoHref, routes, site } from "@/content/site";
import { getPathname } from "@/i18n/navigation";

/** The one action every page leads to: get in touch. */
export function Contact() {
  const t = useTranslations("contact");
  const nav = useTranslations("nav");
  const locale = useLocale();

  return (
    <section id="contact" className={sectionFrame}>
      <div className={container}>
        <div className="rounded-2xl bg-ink px-6 py-14 text-paper sm:px-12 lg:px-16 lg:py-20">
          <h2 className="display text-[clamp(2.75rem,6vw,5.5rem)] tracking-[-0.04em]">{t("title")}</h2>
          <p className="mt-5 max-w-xl text-[18px] leading-7 text-paper/70">{t("body")}</p>

          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <ButtonLink
              href={getPathname({ href: routes.contact, locale })}
              size="lg"
              className="bg-paper text-ink hover:bg-paper/85"
            >
              {nav("contact")}
              <ArrowRight aria-hidden className="size-[18px]" strokeWidth={1.75} />
            </ButtonLink>
            <a
              href={mailtoHref}
              className="text-[16px] text-paper underline decoration-paper/30 underline-offset-4 transition-colors hover:decoration-paper"
            >
              {site.contactEmail}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
