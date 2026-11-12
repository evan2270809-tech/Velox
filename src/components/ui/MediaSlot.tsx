import Image from "next/image";
import { isConceptImage } from "@/content/site";
import { cn } from "@/lib/cn";
import { ConceptLabel } from "./ConceptLabel";

interface MediaSlotProps {
  /** Image path. Swap this (in src/content/site.ts) to replace the picture. */
  src: string;
  /** Used as alt text when the image is a real screen or photo. */
  alt: string;
  sizes: string;
  /** Focal point for concept images, e.g. "center 58%". */
  position?: string;
  className?: string;
}

/**
 * Image frame for a card.
 *
 * Concept illustrations fill the frame and carry a "Concept illustration" label.
 * Anything else is treated as a real screen or photo: no label, and the whole
 * image stays visible so a screenshot is never cropped.
 */
export function MediaSlot({ src, alt, sizes, position, className }: MediaSlotProps) {
  const concept = isConceptImage(src);

  return (
    <div className={cn("relative overflow-hidden bg-midnight-900", className)}>
      <Image
        src={src}
        alt={concept ? "" : alt}
        fill
        sizes={sizes}
        className={concept ? "object-cover" : "object-contain"}
        style={concept && position ? { objectPosition: position } : undefined}
      />
      {concept && (
        <>
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-midnight-700 to-transparent"
          />
          <ConceptLabel className="absolute bottom-3 right-3" />
        </>
      )}
    </div>
  );
}
