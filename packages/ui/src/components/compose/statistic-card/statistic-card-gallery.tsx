"use client";

import { statisticCardPatternCatalog } from "./statistic-card.catalog";
import { StatisticCardPatternCard } from "./statistic-card.shared";

export function StatisticCardComposeGallery() {
  return (
    <div className="grid gap-6">
      {statisticCardPatternCatalog.map(
        ({ name, title, description, component: Component }) => (
          <StatisticCardPatternCard
            key={name}
            title={title}
            description={description}
          >
            <Component />
          </StatisticCardPatternCard>
        ),
      )}
    </div>
  );
}
