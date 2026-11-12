import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Audience } from "@/components/sections/Audience";
import { Building } from "@/components/sections/Building";
import { Contact } from "@/components/sections/Contact";
import { FAQ } from "@/components/sections/FAQ";
import { Hero } from "@/components/sections/Hero";
import { Stage } from "@/components/sections/Stage";
import { Traceability } from "@/components/sections/Traceability";
import { WhyTouch } from "@/components/sections/WhyTouch";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Building />
        <WhyTouch />
        <Traceability />
        <Stage />
        <Audience />

        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
