"use client";

import * as React from "react";

import { Badge } from "../../ui-shadcn/badge";
import {
  Scrollspy,
  ScrollspyLink,
  ScrollspyPatternCard,
  ScrollspySection,
} from "./scrollspy.shared";

const horizontalSections = [
  {
    id: "planning",
    title: "Planning",
    description: "A compact navigation bar for sectioned content.",
    body: [
      "Horizontal scrollspy works best when you want a lightweight top rail instead of a sidebar.",
      "It keeps the active item highlighted while the user reads through the stacked sections below.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Useful for product specs and implementation plans.",
    body: [
      "The target container can be any scrollable element, so the layout remains flexible across dashboards and docs pages.",
      "The component updates the browser hash using replaceState to avoid building a long history trail.",
    ],
  },
  {
    id: "review",
    title: "Review",
    description:
      "Highlights the current card while you move through the content.",
    body: [
      "Active state is applied directly to the link nodes with data attributes, which keeps the styling declarative.",
      "You can also wire an onUpdate callback to synchronize other UI like a status label or progress chip.",
    ],
  },
  {
    id: "release",
    title: "Release",
    description:
      "Pairs well with changelog-style content or one-page product narratives.",
    body: [
      "The same pattern can be reused in article pages, settings surfaces, and onboarding walkthroughs.",
      "The demo keeps the content readable with generous spacing and a constrained width for easy scanning.",
    ],
  },
] as const;

export function ScrollspyHorizontal() {
  const containerRef = React.useRef<HTMLElement>(null);

  return (
    <ScrollspyPatternCard
      title="Horizontal Scrollspy"
      description="A top navigation that stays in sync with long-form content."
    >
      <Scrollspy
        targetRef={containerRef}
        navLabel="Horizontal scrollspy navigation"
        className="flex flex-row flex-wrap rounded-xl border bg-muted/20 p-3"
      >
        {horizontalSections.map((section, index) => (
          <ScrollspyLink
            key={section.id}
            href={`#${section.id}`}
            data-scrollspy-anchor={section.id}
            data-scrollspy-offset={index === 0 ? "0" : "10"}
            variant="outline"
          >
            <Badge variant="secondary" size="xs">
              {index + 1}
            </Badge>
            <span>{section.title}</span>
          </ScrollspyLink>
        ))}
      </Scrollspy>

      <section
        ref={containerRef}
        aria-label="Horizontal scrollspy content"
        className="h-[480px] overflow-y-auto rounded-2xl border bg-background p-4"
      >
        <div className="mx-auto max-w-2xl space-y-4">
          {horizontalSections.map((section) => (
            <ScrollspySection
              key={section.id}
              id={section.id}
              description={section.description}
              title={section.title}
            >
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">Navigation</Badge>
                <Badge variant="outline">Live tracking</Badge>
              </div>
            </ScrollspySection>
          ))}
        </div>
      </section>
    </ScrollspyPatternCard>
  );
}
