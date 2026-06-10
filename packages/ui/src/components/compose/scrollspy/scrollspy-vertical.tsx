"use client";

import * as React from "react";

import { Badge } from "../../ui-shadcn/badge";
import {
  Scrollspy,
  ScrollspyLink,
  ScrollspyPatternCard,
  ScrollspySection,
} from "./scrollspy.shared";

const verticalSections = [
  {
    id: "overview",
    title: "Overview",
    description:
      "The current section stays visible while the document scrolls.",
    body: [
      "Scrollspy maps the active section by watching the scroll container and matching anchors by id.",
      "The links in the navigation inherit the active state through the `data-active` attribute.",
    ],
  },
  {
    id: "structure",
    title: "Structure",
    description: "A clean content stack with a fixed navigation column.",
    body: [
      "The demo uses a separate scroll container so the navigation stays stable while the content moves.",
      "Each section can override the global offset when the layout needs a custom activation threshold.",
    ],
  },
  {
    id: "behavior",
    title: "Behavior",
    description:
      "Smooth scrolling and hash updates stay aligned with section changes.",
    body: [
      "Clicking a link scrolls to the matching section and updates the URL hash without pushing duplicate history entries.",
      "The active link is recalculated after every scroll frame to keep the sidebar in sync.",
    ],
  },
  {
    id: "details",
    title: "Details",
    description: "Useful for docs, settings pages, and long reference panels.",
    body: [
      "The pattern is useful whenever you want a compact table of contents for a long article or settings surface.",
      "The API stays intentionally small: target ref, offset, smooth scrolling, history updates, and an update callback.",
    ],
  },
] as const;

export function ScrollspyVertical() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <ScrollspyPatternCard
      title="Vertical Scrollspy"
      description="A sidebar table of contents with a long scrollable article."
    >
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Scrollspy
            targetRef={containerRef}
            navLabel="Vertical scrollspy navigation"
            className="rounded-xl border bg-muted/20 p-3"
          >
            {verticalSections.map((section, index) => (
              <ScrollspyLink
                key={section.id}
                href={`#${section.id}`}
                data-scrollspy-anchor={section.id}
                data-scrollspy-offset={index === 0 ? "0" : "12"}
                variant={index === 0 ? "default" : "secondary"}
              >
                <Badge variant="outline" size="xs">
                  0{index + 1}
                </Badge>
                <span className="truncate">{section.title}</span>
              </ScrollspyLink>
            ))}
          </Scrollspy>
        </div>

        <div
          ref={containerRef}
          tabIndex={0}
          role="region"
          aria-label="Vertical scrollspy content"
          className="h-[560px] overflow-y-auto rounded-2xl border bg-background p-4"
        >
          <div className="space-y-4">
            {verticalSections.map((section) => (
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
                  <Badge variant="secondary">Docs</Badge>
                  <Badge variant="outline">Active state</Badge>
                  <Badge variant="outline">Smooth scroll</Badge>
                </div>
              </ScrollspySection>
            ))}
          </div>
        </div>
      </div>
    </ScrollspyPatternCard>
  );
}
