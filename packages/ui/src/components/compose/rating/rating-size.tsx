"use client";

import { Rating, RatingPatternCard } from "./rating.shared";

export function RatingSize() {
  return (
    <RatingPatternCard
      title="Size"
      description="Compare small, default, and large star sizes."
    >
      <div className="grid gap-4">
        <Rating rating={4.5} size="sm" showValue />
        <Rating rating={4.5} size="default" showValue />
        <Rating rating={4.5} size="lg" showValue />
      </div>
    </RatingPatternCard>
  );
}
