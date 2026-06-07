import "server-only";

export type { NotificationsKeys } from "./keys.js";
export { keys, loadNotificationsKeys } from "./keys.js";
export { createNotificationsClient, notifications } from "./server.js";
