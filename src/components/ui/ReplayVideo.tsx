"use client";

import { useRef, useState } from "react";
import type { BuildingVideo } from "@/content/site";
import { cn } from "@/lib/cn";

interface ReplayVideoProps {
  video: BuildingVideo;
  /** Accessible name of the video. */
  label: string;
  playLabel: string;
  className?: string;
}

/**
 * Click-to-play screen recording.
 *
 * The frame keeps the recording's own aspect ratio, so no edge of the UI is
 * cropped at any width. Before the first play only a large centred play button
 * sits on the poster, so the browser's control bar does not cover the sensor
 * graphs; once playing, the native controls (seek, fullscreen for reading
 * small text) take over.
 */
export function ReplayVideo({ video, label, playLabel, className }: ReplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    setStarted(true);
    void ref.current?.play().catch(() => setStarted(false));
  };

  return (
    <div
      className={cn("relative overflow-hidden bg-[#f5f5f5]", className)}
      style={{ aspectRatio: `${video.width} / ${video.height}` }}
    >
      <video
        ref={ref}
        className="absolute inset-0 size-full object-contain"
        controls={started}
        playsInline
        muted
        preload="none"
        poster={video.poster}
        width={video.width}
        height={video.height}
        aria-label={label}
        onPlay={() => setStarted(true)}
      >
        <source src={video.src} type="video/mp4" />
      </video>

      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label={playLabel}
          className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-midnight-900/90 text-cream-100 shadow-[0_8px_24px_rgb(18_15_42/0.35)] ring-1 ring-cream-100/20 transition-colors hover:bg-midnight-900 sm:size-[72px]"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="ml-1 size-7 fill-current">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.98-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
