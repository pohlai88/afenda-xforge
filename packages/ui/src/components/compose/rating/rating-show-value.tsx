"use client";

import { Rating, RatingPatternCard } from "./rating.shared";

export function RatingShowValue() {
  return (
    <RatingPatternCard
      title="Show Value"
      description="Display the score as a numeric badge."
    >
      <Rating rating={3.8} showValue />
    </RatingPatternCard>
  );
}
