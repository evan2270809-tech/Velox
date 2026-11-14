import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { logo, routes, site } from "@/content/site";
import { getPathname } from "@/i18n/navigation";
import { HeaderShell } from "./HeaderShell";
import { LangToggle } from "./LangToggle";
import { NavLinks } from "./NavLinks";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const path = (href: string) => getPathname({ href, locale });

  const links = [
    { href: path(routes.why), label: t("why") },
    { href: path(routes.product), label: t("product") },
  ];

  return (
    <HeaderShell>
      <div className="relative mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-5 sm:px-8 lg:h-[72px] lg:gap-8 lg:px-10">
        <a href={path(routes.home)} className="mr-auto shrink-0 md:mr-4">
          <Image
            src={logo.src}
            alt={site.name}
            width={logo.width}
            height={logo.height}
            unoptimized
            priority
            className="h-[15px] w-auto lg:h-4"
          />
        </a>

        <NavLinks items={links} menuLabel={t("menu")} closeLabel={t("close")} />

        <div className="flex items-center gap-2.5 md:ml-auto">
          <LangToggle locale={locale} />
          <ButtonLink href={path(routes.contact)} variant="primary" size="sm">
            {t("contact")}
          </ButtonLink>
        </div>
      </div>
    </HeaderShell>
  );
}
