import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Contact } from "@/components/sections/Contact";
import { PageHero } from "@/components/sections/PageHero";
import { ProductSections } from "@/components/sections/ProductSections";
import { Stage } from "@/components/sections/Stage";
import { site } from "@/content/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  return { title: `${t("title")} — ${site.name}`, description: t("lead") };
}

export default async function ProductPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");

  return (
    <>
      <Header />
      <main>
        <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <ProductSections />
        <Stage />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
