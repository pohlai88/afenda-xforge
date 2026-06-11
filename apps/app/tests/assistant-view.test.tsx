import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";
import { AssistantView } from "../app/(authenticated)/assistant/assistant-view.tsx";

describe("AssistantView", () => {
  it("renders metadata-ui stat sections without KpiCard", () => {
    render(
      <AssistantView
        context={createAppMetadataContext({
          featureId: "system-admin.overview",
          permissions: ["ai.read"],
          tenantId: "tenant-001",
          userId: "user-001",
        })}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Machine assistant" })
    ).toBeInTheDocument();
    expect(screen.getByText("Tenant")).toBeInTheDocument();
    expect(screen.getByText("Permission")).toBeInTheDocument();
  });
});
