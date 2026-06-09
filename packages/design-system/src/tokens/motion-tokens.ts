export const ANIMATION_TOKENS = ["shimmer"] as const;

export const MOTION_PREFERENCE_TOKENS = ["default", "reduced"] as const;

export type AnimationToken = (typeof ANIMATION_TOKENS)[number];
export const MOTION_PREFERENCES: typeof MOTION_PREFERENCE_TOKENS =
  MOTION_PREFERENCE_TOKENS;

export type MotionPreferenceToken = (typeof MOTION_PREFERENCE_TOKENS)[number];
export type MotionPreference = MotionPreferenceToken;
