import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface AnnouncementPillProps {
  label: string;
  href?: string;
}

export function AnnouncementPill({ label, href = "#portfolio" }: AnnouncementPillProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] text-white shadow-[inset_0_0_0_1px_var(--color-ring-on-dark)] backdrop-blur transition-colors hover:bg-white/15"
    >
      <span className="rounded-full bg-[var(--color-brand-orange)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white">
        New
      </span>
      <span>{label}</span>
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
