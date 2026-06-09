import { geolocationRemoteCheckinRouteContracts } from "./contract.ts";

export type GeolocationRemoteCheckinManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof geolocationRemoteCheckinRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const geolocationRemoteCheckinManifest: GeolocationRemoteCheckinManifest =
  {
    id: "hr-suite.time-attendance.geolocation-remote-checkin",
    title: "Geolocation Remote Checkin",
    description:
      "Governed package manifest for the geolocation-remote-checkin slice extracted from the legacy HR suite.",
    domain: "time-attendance",
    packageName: "@repo/features-time-attendance-geolocation-remote-checkin",
    routeContracts: geolocationRemoteCheckinRouteContracts,
    suite: "hr-suite",
  };
