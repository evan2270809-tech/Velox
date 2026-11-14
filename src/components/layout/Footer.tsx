import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { logo, mailtoHref, routes, site } from "@/content/site";
import { getPathname } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const path = (href: string) => getPathname({ href, locale });

  const links = [
    { href: path(routes.home), label: nav("home") },
    { href: path(routes.why), label: nav("why") },
    { href: path(routes.product), label: nav("product") },
    { href: path(routes.contact), label: nav("contact") },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <Image
              src={logo.src}
              alt={site.name}
              width={logo.width}
              height={logo.height}
              unoptimized
              className="h-4 w-auto"
            />
            <p className="mt-6 text-[14px] leading-5 text-ink">{t("company")}</p>
            {site.showFoundedLine && (
              <p className="mt-1 text-[14px] leading-5 text-ink-3">{t("founded")}</p>
            )}
          </div>

          <nav className="flex flex-col gap-3 text-[14px] leading-5 md:text-right">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-ink-2 transition-colors hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 font-mono text-[12px] leading-4 text-ink-3 sm:flex-row sm:justify-between">
          <p>{t("rights")}</p>
          <a href={mailtoHref} className="transition-colors hover:text-ink">
            {site.contactEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
