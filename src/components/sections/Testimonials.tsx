import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Item {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Item[];
  const [hero, ...rest] = items;

  return (
    <section className="border-t border-[var(--color-divider)] bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index={7} eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        {/* Hero pull-quote */}
        {hero && (
          <figure
            className="animate-spring-in relative mt-14 grid gap-10 border-l-2 border-[var(--color-accent)] pl-8 md:grid-cols-[7fr_3fr] md:gap-16"
            style={{ animationDelay: "60ms" }}
          >
            <blockquote
              className="font-serif text-[clamp(26px,3vw,38px)] italic leading-[1.25] tracking-[-0.005em] text-[var(--color-starlight)]"
              style={{ fontWeight: 400 }}
            >
              <span aria-hidden className="text-[var(--color-accent)]">“</span>
              {hero.quote}
              <span aria-hidden className="text-[var(--color-accent)]">”</span>
            </blockquote>
            <figcaption className="flex items-end">
              <div className="flex flex-col gap-1 border-t border-[var(--color-divider)] pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
                <p className="text-[15px] font-medium text-[var(--color-starlight)]">
                  — {hero.author}
                </p>
                <p className="text-[13px] tracking-[0.04em] text-[var(--color-silver)]">
                  {hero.role} · {hero.company}
                </p>
              </div>
            </figcaption>
          </figure>
        )}

        {/* Remaining quotes — 2-up below */}
        {rest.length > 0 && (
          <ul className="mt-16 grid gap-12 border-t border-[var(--color-divider)] pt-12 md:grid-cols-2 md:gap-10">
            {rest.map((item, i) => (
              <li
                key={item.author}
                className="animate-spring-in flex flex-col gap-4"
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <p className="font-serif text-[19px] leading-[1.45] text-[var(--color-starlight)]">
                  <span aria-hidden className="mr-1 text-[var(--color-accent)]">“</span>
                  {item.quote}
                  <span aria-hidden className="ml-0.5 text-[var(--color-accent)]">”</span>
                </p>
                <p className="text-[13px] tracking-[0.04em] text-[var(--color-silver)]">
                  — {item.author}, {item.role} ·{" "}
                  <span className="text-[var(--color-starlight)]">{item.company}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
