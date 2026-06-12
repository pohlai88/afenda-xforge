"use client";

import type { Company } from "@repo/features-master-data-companies/contract";
import type { WorkspaceNavTeam } from "@repo/ui/components/compose/workspace";
import { WorkspaceNavTeamSwitcher } from "@repo/ui/components/compose/workspace";
import { Building2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

const LOADING_TEAM: WorkspaceNavTeam = {
  id: "loading",
  logo: Building2,
  name: "Loading workspace...",
  plan: "Resolving company grants",
};

function toWorkspaceTeam(company: Company): WorkspaceNavTeam {
  return {
    id: company.id,
    logo: Building2,
    name: company.name,
    plan: company.code,
  };
}

type CompaniesLoadResult = {
  activeTeamId?: string;
  teams: readonly WorkspaceNavTeam[];
};

async function fetchCompaniesState(): Promise<CompaniesLoadResult> {
  const [companiesResponse, activeResponse] = await Promise.all([
    fetch("/api/companies?pageSize=100"),
    fetch("/api/companies/active"),
  ]);

  if (!companiesResponse.ok) {
    return { teams: [] };
  }

  const companiesPayload = (await companiesResponse.json()) as {
    data?: { items?: Company[] };
  };
  const companyItems = companiesPayload.data?.items ?? [];

  if (companyItems.length === 0) {
    return { teams: [] };
  }

  const mappedTeams = companyItems.map(toWorkspaceTeam);
  let activeTeamId = mappedTeams[0]?.id;

  if (activeResponse.ok) {
    const activePayload = (await activeResponse.json()) as {
      data?: Company;
    };

    if (activePayload.data?.id) {
      activeTeamId = activePayload.data.id;
    }
  }

  return { activeTeamId, teams: mappedTeams };
}

export function AuthenticatedCompanySwitcher(): ReactElement | null {
  const router = useRouter();
  const [activeTeamId, setActiveTeamId] = useState<string | undefined>();
  const [teams, setTeams] = useState<readonly WorkspaceNavTeam[]>([
    LOADING_TEAM,
  ]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCompanies = async (): Promise<void> => {
      try {
        const result = await fetchCompaniesState();

        if (cancelled) {
          return;
        }

        setTeams(result.teams);

        if (result.activeTeamId) {
          setActiveTeamId(result.activeTeamId);
        }
      } catch {
        if (!cancelled) {
          setTeams([]);
        }
      }
    };

    loadCompanies().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTeamChange = async (team: WorkspaceNavTeam): Promise<void> => {
    if (team.id === activeTeamId || switching) {
      return;
    }

    setSwitching(true);

    try {
      const response = await fetch("/api/companies/select", {
        body: JSON.stringify({ companyId: team.id }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        return;
      }

      setActiveTeamId(team.id);
      router.refresh();
    } finally {
      setSwitching(false);
    }
  };

  if (teams.length === 0) {
    return null;
  }

  return (
    <WorkspaceNavTeamSwitcher
      activeTeamId={activeTeamId}
      menuLabel="Companies"
      onTeamChange={(team) => {
        handleTeamChange(team).catch(() => undefined);
      }}
      showShortcuts={teams.length > 1 && teams.length <= 9}
      teams={teams}
    />
  );
}
