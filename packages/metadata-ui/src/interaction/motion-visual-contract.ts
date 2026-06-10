export const METADATA_REDUCED_MOTION_SAFE_CLASS =
  "motion-reduce:animate-none motion-reduce:transition-none";

export const METADATA_SPINNER_MOTION_CLASS =
  "animate-spin motion-reduce:animate-none";

export const METADATA_PULSE_MOTION_CLASS =
  "animate-pulse motion-reduce:animate-none";

export const METADATA_DIALOG_MOTION_CLASS =
  "motion-reduce:animate-none motion-reduce:transition-none";

export const METADATA_SAFE_OPACITY_TRANSITION_CLASS =
  "transition-opacity motion-reduce:transition-none";

export const METADATA_SAFE_TRANSFORM_TRANSITION_CLASS =
  "transition-transform motion-reduce:transition-none";

const allowedTransitionProperties = new Set(["opacity", "transform"]);

export function resolveMetadataMotionClassName(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function isMetadataSafeTransitionProperty(property: string): boolean {
  return property
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .every((entry) => allowedTransitionProperties.has(entry));
}
