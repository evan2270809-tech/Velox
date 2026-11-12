import Image from "next/image";
import { isConceptImage, type MediaImage } from "@/content/site";
import { cn } from "@/lib/cn";
import { ConceptLabel } from "./ConceptLabel";

interface MediaSlotProps {
  /** Image and its pixel size. Swap it in src/content/site.ts. */
  image: MediaImage;
  /** Used as alt text when the image is a real screen or photo. */
  alt: string;
  sizes: string;
  className?: string;
}

/**
 * Image frame that takes the image's own aspect ratio, so the picture is never
 * cropped at any width. Concept illustrations carry a "Concept illustration" label.
 */
export function MediaSlot({ image, alt, sizes, className }: MediaSlotProps) {
  const concept = isConceptImage(image.src);

  return (
    <div
      className={cn("relative overflow-hidden bg-paper-2", className)}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <Image
        src={image.src}
        alt={concept ? "" : alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
      {concept && <ConceptLabel className="absolute bottom-3 right-3" />}
    </div>
  );
}
