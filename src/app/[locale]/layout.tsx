import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteUrl, ogLocales, shareImages, site, type Locale } from "@/content/site";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

// Latin text. Hangul falls through to Pretendard (see globals.css).
const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
});

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = isLocale(requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "meta" });

  const title = t("title");
  const description = t("description");
  const path = getPathname({ href: "/", locale });
  const image = { url: shareImages[locale], width: 1200, height: 630, alt: title };

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    applicationName: site.name,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: path,
      locale: ogLocales[locale],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#120f2a",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={dmSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
