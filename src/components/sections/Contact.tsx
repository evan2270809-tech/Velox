import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { container } from "@/components/ui/SectionHeader";
import { mailtoHref, site } from "@/content/site";

/** The one action the whole page leads to: an email to the shared company inbox. */
export function Contact() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="pb-24 pt-12 lg:pb-36 lg:pt-16">
      <div className={container}>
        <Reveal className="max-w-2xl">
          <h2 className="display text-[clamp(2.6rem,7vw,4.75rem)]">{t("title")}</h2>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.65] text-cream-100/85 lg:text-[19px]">
            {t("body")}
          </p>

          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <ButtonLink href={mailtoHref} size="lg">
              {t("cta")}
              <ArrowRight aria-hidden className="size-[18px]" strokeWidth={2.4} />
            </ButtonLink>
            <a
              href={mailtoHref}
              className="text-[16px] text-cream-100 underline decoration-cream-100/35 underline-offset-4 transition-colors hover:decoration-cream-100"
            >
              {site.contactEmail}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
