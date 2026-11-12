import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { container } from "@/components/ui/SectionHeader";
import { logo, mailtoHref, site } from "@/content/site";
import { getPathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { HeaderShell } from "./HeaderShell";
import { LangToggle } from "./LangToggle";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();

  const links = [
    { href: "#building", label: t("building") },
    { href: "#why-touch", label: t("whyTouch") },
    { href: "#data", label: t("trace") },
    { href: "#faq", label: t("faq") },
  ];

  return (
    <HeaderShell>
      <div className={cn(container, "flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6")}>
        <a href={getPathname({ href: "/", locale })} className="shrink-0">
          <Image
            src={logo.src}
            alt={site.name}
            width={logo.width}
            height={logo.height}
            unoptimized
            priority
            className="h-5 w-auto lg:h-6"
          />
        </a>

        <nav className="ml-auto hidden items-center gap-7 lg:flex xl:gap-9">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] text-ink-2 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5 lg:ml-2">
          <LangToggle />
          {/* Secondary style on purpose: the orange button belongs to the page content. */}
          <ButtonLink href={mailtoHref} variant="secondary" size="sm">
            {t("contact")}
          </ButtonLink>
        </div>
      </div>
    </HeaderShell>
  );
}
