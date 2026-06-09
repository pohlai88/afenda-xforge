import "server-only";

export type HrOrgAccessContext = {
  canWrite?: boolean;
};

type HrOrgAccessGrant = {
  organization: { id: string };
  session: { id: string };
};

export function requireHrOrgRead(): HrOrgAccessGrant {
  return {
    organization: { id: "org" },
    session: { id: "actor" },
  };
}

export function requireHrOrgWrite(): HrOrgAccessGrant {
  return {
    organization: { id: "org" },
    session: { id: "actor" },
  };
}
