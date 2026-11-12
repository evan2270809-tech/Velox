import Image from "next/image";
import { useTranslations } from "next-intl";
import { container } from "@/components/ui/SectionHeader";
import { logo, mailtoHref, site } from "@/content/site";
import { cn } from "@/lib/cn";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-midnight-600/50 bg-midnight-800">
      <div
        className={cn(
          container,
          "flex flex-col gap-10 py-14 lg:flex-row lg:items-end lg:justify-between lg:py-16",
        )}
      >
        <div>
          <Image
            src={logo.src}
            alt={site.name}
            width={logo.width}
            height={logo.height}
            unoptimized
            className="h-6 w-auto"
          />
          <p className="mt-7 text-[15px] text-cream-100">{t("company")}</p>
          {site.showFoundedLine && (
            <p className="mt-1.5 text-[14px] text-lavender-300">{t("founded")}</p>
          )}
        </div>

        <div className="lg:text-right">
          <a
            href={mailtoHref}
            className="text-[15px] text-cream-100 underline decoration-cream-100/30 underline-offset-4 transition-colors hover:decoration-cream-100"
          >
            {site.contactEmail}
          </a>
          <p className="mt-1.5 text-[14px] text-lavender-300">{t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}
