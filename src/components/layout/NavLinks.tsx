"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

const normalise = (path: string) => (path.length > 1 ? path.replace(/\/$/, "") : path);

/** Page links. Inline from tablet landscape up, a sheet below the bar on phones. */
export function NavLinks({
  items,
  menuLabel,
  closeLabel,
}: {
  items: NavItem[];
  menuLabel: string;
  closeLabel: string;
}) {
  const pathname = normalise(usePathname());
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <nav className="hidden items-center gap-7 md:flex lg:gap-9">
        {items.map((item) => {
          const active = normalise(item.href) === pathname;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-[14px] font-medium transition-colors hover:text-ink",
                active ? "text-ink" : "text-ink-3",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <button
        type="button"
        aria-label={open ? closeLabel : menuLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="order-last grid size-9 place-items-center rounded-[10px] text-ink transition-colors hover:bg-paper-2 md:hidden"
      >
        {open ? <X aria-hidden className="size-5" strokeWidth={1.5} /> : <Menu aria-hidden className="size-5" strokeWidth={1.5} />}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full border-b border-line bg-paper px-5 pb-4 md:hidden">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={normalise(item.href) === pathname ? "page" : undefined}
              className="block border-t border-line py-4 text-[17px] text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
