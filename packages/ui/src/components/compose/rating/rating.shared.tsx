"use client";

import { Star } from "lucide-react";
import type * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

type RatingSize = "sm" | "default" | "lg";

function sizeClasses(size: RatingSize) {
  switch (size) {
    case "sm":
      return {
        star: "size-4",
        gap: "gap-1",
        value: "text-xs",
      };
    case "lg":
      return {
        star: "size-7",
        gap: "gap-1.5",
        value: "text-base",
      };
    default:
      return {
        star: "size-5",
        gap: "gap-1.5",
        value: "text-sm",
      };
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snap(value: number, step = 0.5) {
  return Math.round(value / step) * step;
}

function Rating({
  rating,
  maxRating = 5,
  size = "default",
  showValue = false,
  editable = false,
  onRatingChange,
  starClassName,
  className,
}: {
  rating: number;
  maxRating?: number;
  size?: RatingSize;
  showValue?: boolean;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  starClassName?: string;
  className?: string;
}) {
  const classes = sizeClasses(size);

  const setRatingFromPosition = (
    event: React.MouseEvent<HTMLButtonElement>,
    starIndex: number,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    const nextRating = snap(starIndex + (position > 0.5 ? 1 : 0.5));
    onRatingChange?.(clamp(nextRating, 0.5, maxRating));
  };

  return (
    <div className={cn("inline-flex items-center", classes.gap, className)}>
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starNumber = index + 1;
          const fill = clamp(rating - index, 0, 1);
          if (editable) {
            return (
              <button
                key={starNumber}
                type="button"
                className="relative inline-flex items-center justify-center"
                aria-label={`Set rating to ${starNumber}`}
                onClick={(event) => setRatingFromPosition(event, index)}
              >
                <Star
                  className={cn(
                    classes.star,
                    "text-muted-foreground/35",
                    starClassName,
                  )}
                />
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                  aria-hidden="true"
                >
                  <Star
                    className={cn(
                      classes.star,
                      "fill-yellow-400 text-yellow-400",
                      starClassName,
                    )}
                  />
                </span>
              </button>
            );
          }

          return (
            <span
              key={starNumber}
              className="relative inline-flex items-center justify-center"
            >
              <Star
                className={cn(
                  classes.star,
                  "text-muted-foreground/35",
                  starClassName,
                )}
              />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
                aria-hidden="true"
              >
                <Star
                  className={cn(
                    classes.star,
                    "fill-yellow-400 text-yellow-400",
                    starClassName,
                  )}
                />
              </span>
            </span>
          );
        })}
      </div>

      {showValue ? (
        <Badge
          variant="secondary"
          className={cn("rounded-full", classes.value)}
        >
          {rating.toFixed(rating % 1 === 0 ? 0 : 1)}
        </Badge>
      ) : null}
    </div>
  );
}

function RatingPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export type { RatingSize };
export { Rating, RatingPatternCard };
