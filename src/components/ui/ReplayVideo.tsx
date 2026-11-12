"use client";

import { useEffect, useRef } from "react";
import type { BuildingVideo } from "@/content/site";
import { cn } from "@/lib/cn";

interface ReplayVideoProps {
  video: BuildingVideo;
  /** Accessible name of the video. */
  label: string;
  className?: string;
}

/**
 * A silent screen recording shown as part of the page, not as a player:
 * no controls, no play button. It loops while it is on screen and pauses when
 * it scrolls away. Visitors who prefer reduced motion see the still poster.
 *
 * The frame keeps the recording's own aspect ratio, so no edge of the UI is
 * cropped at any width.
 */
export function ReplayVideo({ video, label, className }: ReplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const play = () => void el.play().catch(() => {});
    if (!("IntersectionObserver" in window)) {
      el.preload = "auto";
      play();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.preload = "auto";
          play();
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("relative overflow-hidden bg-[#f5f5f5]", className)}
      style={{ aspectRatio: `${video.width} / ${video.height}` }}
    >
      <video
        ref={ref}
        className="absolute inset-0 size-full object-contain"
        muted
        loop
        playsInline
        preload="none"
        poster={video.poster}
        width={video.width}
        height={video.height}
        aria-label={label}
        disablePictureInPicture
      >
        <source src={video.src} type="video/mp4" />
      </video>
    </div>
  );
}
