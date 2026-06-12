import type { ReactElement, ReactNode } from "react";
import { MetadataFeatureShell } from "../metadata-feature-shell.tsx";

export type FeatureScaffoldProps = {
  children?: ReactNode;
  description: string;
  featureId: string;
  title: string;
};

export function FeatureScaffold({
  children,
  description,
  featureId,
  title,
}: FeatureScaffoldProps): ReactElement {
  return (
    <MetadataFeatureShell featureId={featureId}>
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
          <p className="max-w-2xl text-muted-foreground text-sm">{description}</p>
        </header>
        {children}
      </div>
    </MetadataFeatureShell>
  );
}
