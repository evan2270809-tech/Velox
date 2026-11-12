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
import { RevealObserver } from "@/components/ui/RevealObserver";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { sectionImages } from "@/content/site";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <RevealObserver />
      <Header />
      <main>
        <Hero />
        <Building />
        <WhyTouch />
        <Traceability />
        <Stage />
        <Audience />

        {/* FAQ and contact share one background image, anchored behind the contact block. */}
        <div className="relative isolate overflow-hidden bg-midnight-900">
          <SectionBackdrop
            src={sectionImages.faqContact}
            tone="900"
            variant="bottom"
            sizes="(max-width: 1023px) 220vw, 100vw"
            className="inset-x-0 bottom-0 h-[30rem] lg:h-[44rem]"
            imageClassName="object-[70%_bottom] lg:object-bottom"
            labelClassName="bottom-4 right-4 lg:bottom-8 lg:right-10"
          />
          <FAQ />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
