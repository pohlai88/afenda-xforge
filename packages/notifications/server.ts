import "server-only";

import { Knock } from "@knocklabs/node";
import { loadNotificationsKeys } from "./keys.js";

export const createNotificationsClient = (): Knock | null => {
  const { KNOCK_SECRET_API_KEY } = loadNotificationsKeys();

  if (!KNOCK_SECRET_API_KEY) {
    return null;
  }

  return new Knock({ apiKey: KNOCK_SECRET_API_KEY });
};

export const notifications = createNotificationsClient();
