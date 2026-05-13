import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  const t = useTranslations("about");

  return (
    <section
      id="about"
      className="border-t border-[var(--color-divider)] bg-[var(--color-abyss)] py-24 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="animate-spring-in flex flex-col gap-5 lg:col-span-7">
            <SectionHeading index={8} eyebrow={t("eyebrow")} title={t("title")} />
            <p className="max-w-2xl text-[18px] leading-[1.6] text-[var(--color-silver)]">
              {t("body")}
            </p>
          </div>

          <div
            className="animate-spring-in lg:col-span-5"
            style={{ animationDelay: "120ms" }}
          >
            <figure className="flex h-full flex-col justify-center gap-6 border-l-2 border-[var(--color-accent)] bg-white p-8 shadow-[var(--shadow-card-rest)]">
              <p
                className="font-serif text-[22px] italic leading-[1.4] text-[var(--color-starlight)]"
                style={{ fontWeight: 400 }}
              >
                <span aria-hidden className="text-[var(--color-accent)]">“</span>
                {t("quote")}
                <span aria-hidden className="text-[var(--color-accent)]">”</span>
              </p>
              <figcaption className="text-[13px] tracking-[0.04em] text-[var(--color-silver)]">
                — {t("quoteAuthor")}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
