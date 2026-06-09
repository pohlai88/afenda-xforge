"use client";

import { Rating, RatingPatternCard } from "./rating.shared";

export function RatingDecimal() {
  return (
    <RatingPatternCard
      title="Rating"
      description="A read-only score with partial star fill."
    >
      <Rating rating={4.5} />
    </RatingPatternCard>
  );
}
