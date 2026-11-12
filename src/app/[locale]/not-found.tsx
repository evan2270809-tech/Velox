import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getPathname } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="display text-[5rem] text-cream-100">404</p>
      <p className="mt-3 text-[17px] text-lavender-300">{t("title")}</p>
      <ButtonLink
        href={getPathname({ href: "/", locale })}
        variant="secondary"
        className="mt-8"
      >
        {t("back")}
      </ButtonLink>
    </main>
  );
}
