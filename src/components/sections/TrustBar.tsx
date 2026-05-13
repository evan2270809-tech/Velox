import { useTranslations } from "next-intl";

export function TrustBar() {
  const t = useTranslations("trust");
  const logos = t.raw("logos") as string[];
  const doubled = [...logos, ...logos];

  return (
    <section
      aria-label="Trust bar"
      className="border-y border-[var(--color-divider)] bg-[var(--color-abyss)] py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-silver)]">
          {t("eyebrow")}
        </p>

        <div className="mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div
            className="marquee-track flex w-max items-center"
            aria-hidden
          >
            {doubled.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="flex items-center text-[16px] font-medium tracking-tight text-[var(--color-silver)] opacity-80"
              >
                <span className="px-8">{label}</span>
                <span aria-hidden className="text-[var(--color-lead)]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
