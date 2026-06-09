"use client";

import { lineChartPatternCatalog } from "./line-chart.catalog";
import { LineChartPatternCard } from "./line-chart.shared";

export function LineChartComposeGallery() {
  return (
    <div className="grid gap-6">
      {lineChartPatternCatalog.map(
        ({ name, title, description, component: Component }) => (
          <LineChartPatternCard
            key={name}
            title={title}
            description={description}
          >
            <Component />
          </LineChartPatternCard>
        ),
      )}
    </div>
  );
}
