import { act, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
  type AfendaTenantBrandingSettings,
} from "@repo/design-system/contracts/afenda/customization";
import {
  TenantBrandingProvider,
  useTenantBranding,
} from "../app/_components/tenant-branding-context.tsx";

vi.mock("../app/_components/theme-preference-sync.tsx", () => ({
  ThemePreferenceSync: (): null => null,
}));

function SaveCompactDensityProbe(): ReactElement {
  const { setTenantBranding } = useTenantBranding();

  return (
    <button
      onClick={() =>
        setTenantBranding({
          ...AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
          density: "compact",
        })
      }
      type="button"
    >
      Save compact density
    </button>
  );
}

describe("TenantDensitySync", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-density");
  });

  it("sets data-density on html when tenant branding saves compact without remounting", async () => {
    const htmlElement = document.documentElement;

    render(
      <TenantBrandingProvider
        tenantBranding={AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS}
        tenantId="tenant-001"
        userId="user-001"
      >
        <SaveCompactDensityProbe />
        <span data-testid="shell-probe">shell-mounted</span>
      </TenantBrandingProvider>
    );

    expect(htmlElement.getAttribute("data-density")).toBeNull();
    expect(screen.getByTestId("shell-probe")).toBeInTheDocument();

    await act(async () => {
      screen.getByRole("button", { name: "Save compact density" }).click();
    });

    await waitFor(() => {
      expect(htmlElement.getAttribute("data-density")).toBe("compact");
    });

    expect(screen.getByTestId("shell-probe")).toBeInTheDocument();
  });

  it("clears data-density when tenant density returns to default", async () => {
    const initialBranding: AfendaTenantBrandingSettings = {
      ...AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
      density: "compact",
    };

    function ResetDensityProbe(): ReactElement {
      const { setTenantBranding } = useTenantBranding();

      return (
        <button
          onClick={() =>
            setTenantBranding({
              ...AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
              density: undefined,
            })
          }
          type="button"
        >
          Reset density
        </button>
      );
    }

    render(
      <TenantBrandingProvider
        tenantBranding={initialBranding}
        tenantId="tenant-001"
        userId="user-001"
      >
        <ResetDensityProbe />
      </TenantBrandingProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-density")).toBe(
        "compact"
      );
    });

    await act(async () => {
      screen.getByRole("button", { name: "Reset density" }).click();
    });

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-density")).toBeNull();
    });
  });
});
