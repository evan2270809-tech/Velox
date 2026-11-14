import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GloveLab } from "@/components/sections/GloveLab";
import { SensorLab } from "@/components/sections/SensorLab";
import { CaptureKitDiagram } from "@/components/ui/CaptureKitDiagram";
import { ReplayVideo } from "@/components/ui/ReplayVideo";
import { container, sectionFrame } from "@/components/ui/SectionHeader";
import { StatusBadge, type Status } from "@/components/ui/StatusBadge";
import { heroVideo } from "@/content/site";
import { cn } from "@/lib/cn";

const READOUT = ["episode", "excerpt", "camera", "glove", "usb"] as const;
const STREAMS = ["rgbd", "tactile", "motion", "time", "task"] as const;
const KIT = ["gloves", "wrist", "head", "audio"] as const;

function Feature({
  index,
  status,
  title,
  body,
  className,
}: {
  index?: string;
  status: Status;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        {index && <span className="font-mono text-[12px] leading-4 text-ink-3">{index}</span>}
        <StatusBadge status={status} />
      </div>
      <h2 className="display mt-4 text-[30px] lg:text-[44px]">{title}</h2>
      <p className="mt-4 max-w-xl text-[17px] leading-7 text-ink-2 lg:text-[19px] lg:leading-8">{body}</p>
    </div>
  );
}

function Split({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className={cn(container, "grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16")}>
      {head}
      <div>{children}</div>
    </div>
  );
}

/** The product page body: what exists today first, then the design concepts in 3D. */
export function ProductSections() {
  const t = useTranslations("building.items");
  const hero = useTranslations("hero");
  const home = useTranslations("home");
  const p = useTranslations("product");

  return (
    <>
      {/* Working today: the prototype and the software that replays it */}
      <section id="prototype" className={sectionFrame}>
        <div className={container}>
          <figure>
            <div className="relative overflow-hidden rounded-2xl border border-line">
              <ReplayVideo video={heroVideo} label={hero("media.caption")} />
              {/* The USB panel is a still in the recording; this lays a slowly drifting
                  copy of the same still over it. Position = the panel inside the 1920×900 frame. */}
              <div
                aria-hidden
                className="pointer-events-none absolute overflow-hidden"
                style={{ left: "74.69%", top: "29.33%", width: "23.02%", height: "25.11%" }}
              >
                <div
                  className="usb-drift size-full"
                  style={{
                    backgroundImage: `url(${heroVideo.poster})`,
                    backgroundSize: "434.39% 398.23%",
                    backgroundPosition: "97.02% 39.17%",
                  }}
                />
              </div>
            </div>
            <figcaption className="mt-4 grid gap-1 text-[14px] leading-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6">
              <span className="flex items-center gap-2 font-medium text-ink">
                <span aria-hidden className="size-2 rounded-full bg-velox-orange" />
                {hero("media.caption")}
              </span>
              <span className="text-ink-2">{hero("media.detail")}</span>
            </figcaption>
          </figure>

          <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-2 lg:gap-16">
            <Feature
              index="01"
              status="working"
              title={t("glovePrototype.title")}
              body={t("glovePrototype.body")}
            />
            <div>
              <Feature
                index="02"
                status="development"
                title={t("collectionSoftware.title")}
                body={t("collectionSoftware.body")}
              />
              <dl className="mt-8 border-t border-line font-mono text-[12px] leading-5 sm:text-[13px]">
                {READOUT.map((key) => (
                  <div
                    key={key}
                    className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 border-b border-line py-2.5 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
                  >
                    <dt className="text-ink-3">{t(`collectionSoftware.readout.${key}.label`)}</dt>
                    <dd className="text-ink [overflow-wrap:anywhere]">
                      {t(`collectionSoftware.readout.${key}.value`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Whole-hand glove, in 3D */}
      <section id="glove" className={sectionFrame}>
        <div className={container}>
          <Feature
            index="03"
            status="concept"
            title={t("wholeHandGlove.title")}
            body={t("wholeHandGlove.body")}
          />
          <div className="mt-10 lg:mt-14">
            <GloveLab
              labels={{
                viewLabel: p("lab.viewLabel"),
                poseLabel: p("lab.poseLabel"),
                views: { palm: p("lab.views.palm"), back: p("lab.views.back"), side: p("lab.views.side") },
                poses: {
                  relaxed: p("lab.poses.relaxed"),
                  flat: p("lab.poses.flat"),
                  grip: p("lab.poses.grip"),
                },
                hint: p("lab.hint"),
                stackLabel: p("lab.stackLabel"),
                assembled: p("lab.assembled"),
                exploded: p("lab.exploded"),
                layers: {
                  pads: p("lab.layers.pads"),
                  shell: p("lab.layers.shell"),
                  inner: p("lab.layers.inner"),
                  hub: p("lab.layers.hub"),
                },
                note: home("conceptNote"),
                canvasLabel: home("canvasLabel"),
              }}
            />
          </div>
        </div>
      </section>

      {/* Fingertip sensor, as layers */}
      <section id="sensor" className={sectionFrame}>
        <div className={container}>
          <Feature
            index="04"
            status="concept"
            title={t("fingertipShearSensor.title")}
            body={t("fingertipShearSensor.body")}
          />
          <div className="mt-10 lg:mt-14">
            <SensorLab
              labels={{
                modeLabel: p("sensor.modeLabel"),
                stackLabel: p("sensor.stackLabel"),
                modes: {
                  normal: {
                    label: p("sensor.modes.normal.label"),
                    caption: p("sensor.modes.normal.caption"),
                  },
                  tangential: {
                    label: p("sensor.modes.tangential.label"),
                    caption: p("sensor.modes.tangential.caption"),
                  },
                },
                exploded: p("sensor.exploded"),
                assembled: p("sensor.assembled"),
                layers: {
                  shield: p("sensor.layers.shield"),
                  top: p("sensor.layers.top"),
                  pillars: p("sensor.layers.pillars"),
                  bottom: p("sensor.layers.bottom"),
                },
                note: p("sensor.note"),
                hint: p("sensor.hint"),
                canvasLabel: p("sensor.canvasLabel"),
              }}
            />
          </div>
        </div>
      </section>

      {/* Capture system */}
      <section id="system" className={sectionFrame}>
        <Split
          head={
            <Feature
              index="05"
              status="development"
              title={t("captureSystem.title")}
              body={t("captureSystem.body")}
            />
          }
        >
          <div className="rounded-2xl border border-line bg-paper-2 p-4 sm:p-8">
            <CaptureKitDiagram label={p("kit.diagram")} />
          </div>
          <p className="eyebrow mt-8">{p("kit.label")}</p>
          <ul className="mt-3 grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
            {KIT.map((key, i) => (
              <li key={key} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-line py-4">
                <span className="pt-1 font-mono text-[12px] leading-4 text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[17px] font-medium leading-6 text-ink">
                    {p(`kit.items.${key}.title`)}
                  </span>
                  <span className="mt-1 block text-[15px] leading-6 text-ink-2">
                    {p(`kit.items.${key}.body`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[12px] leading-4 text-ink-3">{p("kit.note")}</p>
        </Split>
      </section>

      {/* Data format */}
      <section id="format" className={sectionFrame}>
        <Split
          head={
            <Feature
              index="06"
              status="development"
              title={t("dataFormat.title")}
              body={t("dataFormat.body")}
            />
          }
        >
          <ul className="border-t border-line">
            {STREAMS.map((key, i) => (
              <li
                key={key}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline border-b border-line py-5"
              >
                <span className="font-mono text-[12px] leading-4 text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[20px] leading-7 text-ink lg:text-[24px] lg:leading-8">
                  {home(`streams.${key}`)}
                </span>
              </li>
            ))}
          </ul>
        </Split>
      </section>
    </>
  );
}
