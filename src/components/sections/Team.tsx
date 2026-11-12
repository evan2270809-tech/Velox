import { useLocale, useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamCard } from "./shared/TeamCard";
import { team } from "@/content/team";

export function Team() {
  const t = useTranslations("team");
  const locale = useLocale() as "ko" | "en";

  return (
    <section
      id="team"
      className="border-t border-[var(--color-divider)] bg-white py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
          {team.map((m, i) => (
            <li key={m.slug}>
              <TeamCard
                name={m.name[locale]}
                role={t(`roles.${m.role}`)}
                education={m.education[locale]}
                photoSlug={m.slug}
                email={m.links?.email}
                linkedin={m.links?.linkedin}
                index={i}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
