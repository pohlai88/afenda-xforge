import { expect, test } from "@playwright/test";

const THEME_STUDIO_WORKSPACE_RAIL = "/en/theme-studio/workspace-rail";

test.describe("Notifications bell", () => {
  test("theme studio wires popover trigger instead of tooltip-only fallback", async ({
    page,
  }) => {
    await page.goto(THEME_STUDIO_WORKSPACE_RAIL, {
      waitUntil: "networkidle",
    });

    const trigger = page.getByRole("button", { name: /^Notifications/i });
    await expect(trigger).toBeVisible({ timeout: 30_000 });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");

    await trigger.click();

    const archiveAll = page.getByRole("button", { name: "Archive all" });
    await expect(archiveAll).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: "Mark all as read" })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
