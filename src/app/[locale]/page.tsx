import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { CapabilityStack } from "@/components/sections/CapabilityStack";
import { Process } from "@/components/sections/Process";
import { Comparison } from "@/components/sections/Comparison";
import { Team } from "@/components/sections/Team";
import { Methodology } from "@/components/sections/Methodology";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

// Retired sections (2026-05): TrustBar (fake client names), Metrics (aggregate numbers
// inconsistent with EST. 2026), Portfolio (fake case studies with over-specific KPIs),
// Testimonials, About. Source files kept under src/components/sections/ for future
// re-enable when real client data exists.

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <CapabilityStack />
        <Services />
        <Process />
        <Comparison />
        <Team />
        <Methodology />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
