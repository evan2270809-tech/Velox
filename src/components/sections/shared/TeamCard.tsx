import Image from "next/image";
import { Mail, Linkedin, GraduationCap } from "lucide-react";

interface TeamCardProps {
  name: string;
  role: string;
  education?: string;
  photoSlug: string;
  email?: string;
  linkedin?: string;
  index?: number;
}

export function TeamCard({
  name,
  role,
  education,
  photoSlug,
  email,
  linkedin,
  index = 0,
}: TeamCardProps) {
  return (
    <figure
      className="animate-spring-in flex flex-col gap-4"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-white"
        style={{ boxShadow: "inset 0 0 0 1px rgba(15,15,18,0.08)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(242,160,58,0.10) 0%, rgba(15,15,18,0.04) 100%)",
          }}
        />
        <Image
          src={`/team/${photoSlug}.jpg`}
          alt={name}
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 100vw"
          className="object-cover"
          unoptimized
        />
      </div>
      <figcaption className="flex flex-col gap-1.5 text-center">
        <p
          className="font-display text-[18px] leading-tight text-[var(--color-starlight)]"
          style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          {name}
        </p>
        <p
          className="text-[11px] font-medium uppercase text-[var(--color-accent-press)]"
          style={{ letterSpacing: "0.14em" }}
        >
          {role}
        </p>
        {education && (
          <p className="mt-1 inline-flex items-center justify-center gap-1.5 text-[12px] text-[var(--color-silver)]">
            <GraduationCap className="size-3.5" strokeWidth={1.75} />
            <span>{education}</span>
          </p>
        )}
        {(email || linkedin) && (
          <div className="mt-1 flex items-center justify-center gap-2">
            {email && (
              <a
                href={`mailto:${email}`}
                aria-label={`Email ${name}`}
                className="text-[var(--color-silver)] transition-colors hover:text-[var(--color-accent-press)]"
              >
                <Mail className="size-4" />
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} on LinkedIn`}
                className="text-[var(--color-silver)] transition-colors hover:text-[var(--color-accent-press)]"
              >
                <Linkedin className="size-4" />
              </a>
            )}
          </div>
        )}
      </figcaption>
    </figure>
  );
}
