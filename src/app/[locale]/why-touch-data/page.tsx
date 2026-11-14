import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Audience } from "@/components/sections/Audience";
import { Contact } from "@/components/sections/Contact";
import { Evidence } from "@/components/sections/Evidence";
import { FAQ } from "@/components/sections/FAQ";
import { PageHero } from "@/components/sections/PageHero";
import { Traceability } from "@/components/sections/Traceability";
import { site } from "@/content/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "why" });
  return { title: `${t("title")} — ${site.name}` };
}

export default async function WhyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("why");
  const touch = await getTranslations("whyTouch");

  return (
    <>
      <Header />
      <main>
        <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={touch("lead")} />
        <Evidence />
        <Traceability />
        <Audience />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
