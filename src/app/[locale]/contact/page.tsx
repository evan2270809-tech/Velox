import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ContactForm } from "@/components/sections/ContactForm";
import { FAQ } from "@/components/sections/FAQ";
import { container } from "@/components/ui/SectionHeader";
import { mailtoHref, site } from "@/content/site";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: `${t("title")} — ${site.name}`, description: t("body") };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const p = await getTranslations("contactPage");

  return (
    <>
      <Header />
      <main>
        <section className="pb-20 pt-32 lg:pb-28 lg:pt-44">
          <div className={cn(container, "grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16")}>
            <div>
              <p className="eyebrow rise">{p("eyebrow")}</p>
              <h1 className="display rise mt-5 text-[clamp(2.75rem,7.4vw,6.5rem)] tracking-[-0.04em]">
                {t("title")}
              </h1>
              <p className="rise mt-6 max-w-md text-[18px] leading-7 text-ink-2 lg:text-[21px] lg:leading-8">
                {t("body")}
              </p>
              <p className="eyebrow mt-12">{p("direct")}</p>
              <a
                href={mailtoHref}
                className="mt-2 inline-block text-[17px] leading-7 text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink [overflow-wrap:anywhere]"
              >
                {site.contactEmail}
              </a>
            </div>

            <div className="rounded-2xl border border-line p-6 lg:p-10">
              <ContactForm
                email={site.contactEmail}
                labels={{
                  company: p("form.company"),
                  name: p("form.name"),
                  email: p("form.email"),
                  type: p("form.type"),
                  types: {
                    data: p("form.types.data"),
                    research: p("form.types.research"),
                    other: p("form.types.other"),
                  },
                  message: p("form.message"),
                  messageHint: p("form.messageHint"),
                  submit: p("form.submit"),
                  note: p("form.note"),
                  subject: p("form.subject"),
                }}
              />
            </div>
          </div>
        </section>
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
