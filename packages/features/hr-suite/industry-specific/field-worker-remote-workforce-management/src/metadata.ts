export type FieldWorkerRemoteWorkforceManagementMetadata = {
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

export const fieldWorkerRemoteWorkforceManagementMetadata: FieldWorkerRemoteWorkforceManagementMetadata =
  {
    id: "hr-suite.industry-specific.field-worker-remote-workforce-management",
    title: "Field Worker Remote Workforce Management",
    description:
      "Placeholder metadata for the extracted HR Suite slice. Replace with governed metadata during implementation.",
    domain: "industry-specific",
    labels: {
      singular: "Field Worker Remote Workforce Management record",
      plural: "Field Worker Remote Workforce Management records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
