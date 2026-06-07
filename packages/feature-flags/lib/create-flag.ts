import { analytics } from "@repo/analytics/server";
import { getCurrentAuthenticatedUserId } from "@repo/auth/server";
import { flag } from "flags/next";

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      const userId = await getCurrentAuthenticatedUserId();

      if (!userId) {
        return this.defaultValue as boolean;
      }

      if (!analytics) {
        return this.defaultValue as boolean;
      }

      const isEnabled = await analytics.isFeatureEnabled(key, userId);

      return isEnabled ?? (this.defaultValue as boolean);
    },
  });
