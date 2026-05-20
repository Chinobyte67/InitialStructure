import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface CoverArtProps {
  colors?: [string, string];
  size?: "sm" | "md" | "lg";
  className?: string;
  rounded?: string;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-full aspect-square",
  lg: "w-full aspect-square",
};

/**
 * Vinyl-style cover art used throughout the app.
 * Uses CSS vars to drive the gradient defined in styles.css (.cover-art).
 */
export function CoverArt({ colors, size = "md", className, rounded = "rounded-md" }: CoverArtProps) {
  const style = {
    "--cover-from": colors?.[0] ?? "transparent",
    "--cover-to": colors?.[1] ?? "transparent",
  } as CSSProperties;
  return (
    <div
      style={style}
      className={cn("cover-art shadow-emboss overflow-hidden", rounded, sizeMap[size], className)}
    />
  );
}
