"use client";

import * as React from "react";

import { Rating, RatingPatternCard } from "./rating.shared";

export function RatingEditable() {
  const [rating, setRating] = React.useState(4.5);

  return (
    <RatingPatternCard
      title="Editable"
      description="Click a star to update the current rating."
    >
      <Rating rating={rating} editable showValue onRatingChange={setRating} />
    </RatingPatternCard>
  );
}
