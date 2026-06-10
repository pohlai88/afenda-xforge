"use client";

import { stepperPatternCatalog } from "./stepper.catalog";

export function StepperComposeGallery() {
  return (
    <div className="grid gap-6">
      {stepperPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
