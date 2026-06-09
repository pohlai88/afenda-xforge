export type GeolocationRemoteCheckinMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const geolocationRemoteCheckinMetadata: GeolocationRemoteCheckinMetadata =
  {
    id: "hr-suite.time-attendance.geolocation-remote-checkin",
    title: "Geolocation Remote Checkin",
    description:
      "Governed metadata for the geolocation-remote-checkin feature extracted from the legacy HR suite.",
    domain: "time-attendance",
    labels: {
      singular: "Geolocation Remote Checkin record",
      plural: "Geolocation Remote Checkin records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
