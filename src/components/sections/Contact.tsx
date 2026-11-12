import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { container, sectionFrame } from "@/components/ui/SectionHeader";
import { mailtoHref, site } from "@/content/site";

/** The one action the whole page leads to: an email to the shared company inbox. */
export function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className={sectionFrame}>
      <div className={container}>
        <div className="rounded-2xl bg-paper-2 px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <h2 className="display text-[40px] lg:text-[56px]">{t("title")}</h2>
          <p className="mt-4 max-w-xl text-[18px] leading-7 text-ink-2">
            {t("body")}
          </p>

          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <ButtonLink href={mailtoHref} size="lg">
              {t("cta")}
              <ArrowRight aria-hidden className="size-[18px]" strokeWidth={1.75} />
            </ButtonLink>
            <a
              href={mailtoHref}
              className="text-[16px] text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
            >
              {site.contactEmail}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
