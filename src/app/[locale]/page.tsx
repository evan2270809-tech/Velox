import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HomeStory } from "@/components/sections/HomeStory";
import { HomeAfter } from "@/components/sections/HomeAfter";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/content/site";
import { getPathname } from "@/i18n/navigation";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const hero = await getTranslations("hero");
  const items = await getTranslations("building.items");
  const path = (href: string) => getPathname({ href, locale });

  return (
    <>
      <Header />
      <main>
        <HomeStory
          chip={hero("chip")}
          headline={[t("headline1"), t("headline2")]}
          sub={hero("sub")}
          conceptNote={t("heroNote")}
          hint={t("hint")}
          canvasLabel={t("heroCanvasLabel")}
          traceNote={t("traceNote")}
          actions={
            <>
              <ButtonLink href={path(routes.contact)}>{hero("ctaPrimary")}</ButtonLink>
              <ButtonLink href={path(routes.product)} variant="secondary">
                {hero("ctaSecondary")}
              </ButtonLink>
            </>
          }
          chapters={[
            {
              badge: <StatusBadge status="concept" />,
              title: items("wholeHandGlove.title"),
              body: items("wholeHandGlove.body"),
              link: { href: `${path(routes.product)}#glove`, label: t("links.wholeHand") },
            },
            {
              badge: <StatusBadge status="concept" />,
              title: items("fingertipShearSensor.title"),
              body: items("fingertipShearSensor.body"),
              link: { href: `${path(routes.product)}#sensor`, label: t("links.shear") },
            },
            {
              badge: <StatusBadge status="development" />,
              title: items("captureSystem.title"),
              body: items("captureSystem.body"),
              link: { href: `${path(routes.product)}#system`, label: t("links.capture") },
            },
          ]}
          tags={[t("tags.glove"), t("tags.contact"), t("tags.robot")]}
          streams={[
            { label: t("streams.rgbd") },
            { label: t("streams.tactile"), live: true },
            { label: t("streams.motion") },
            { label: t("streams.time") },
            { label: t("streams.task") },
          ]}
        />
        <HomeAfter />
      </main>
      <Footer />
    </>
  );
}
