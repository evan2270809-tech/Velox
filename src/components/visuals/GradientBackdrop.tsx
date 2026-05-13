import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface GradientBackdropProps {
  children: ReactNode;
  className?: string;
}

export function GradientBackdrop({ children, className }: GradientBackdropProps) {
  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Soft light wash from the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-noise)" }}
      />
      {/* Subtle dot grid for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black 0%, transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
