"use client";

import { cn } from "@/lib/cn";

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

/** A small set of mutually exclusive choices, shown as one control. */
export function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div className={cn("inline-flex flex-wrap gap-0.5 rounded-xl p-0.5 ring-1 ring-inset ring-line", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 rounded-[10px] px-3 text-[13px] font-medium transition-colors",
              active ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
