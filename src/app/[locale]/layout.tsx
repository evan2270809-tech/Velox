import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Source_Serif_4, Noto_Serif_KR } from "next/font/google";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSerifKR = Noto_Serif_KR({
  weight: ["500", "600", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Velox BD — AX consulting for SMBs",
    template: "%s · Velox BD",
  },
  description:
    "Velox BD embeds automation and AI into the way small and mid-sized teams already work — half the cost, twice the speed.",
  metadataBase: new URL("https://veloxbd.example"),
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
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
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${sourceSerif.variable} ${notoSerifKR.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
