import type * as React from "react";

import { RatingDecimal } from "./rating-decimal";
import { RatingEditable } from "./rating-editable";
import { RatingShowValue } from "./rating-show-value";
import { RatingSize } from "./rating-size";

export type RatingPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const ratingPatternCatalog = [
  {
    name: "decimal",
    title: "Rating",
    description: "A star rating with decimal support and partial fills.",
    component: RatingDecimal,
  },
  {
    name: "show-value",
    title: "Show Value",
    description: "Displays the numeric score next to the stars.",
    component: RatingShowValue,
  },
  {
    name: "editable",
    title: "Editable",
    description: "Users can click stars to update the rating.",
    component: RatingEditable,
  },
  {
    name: "size",
    title: "Size",
    description: "Shows the available compact and spacious star sizes.",
    component: RatingSize,
  },
] as const satisfies readonly RatingPatternSpec[];

export type RatingPatternName = (typeof ratingPatternCatalog)[number]["name"];

export const ratingPatternCount = ratingPatternCatalog.length;
export const ratingPatternNames = ratingPatternCatalog.map(
  (pattern) => pattern.name,
) as RatingPatternName[];
