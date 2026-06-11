"use client";

import type { Company } from "@repo/features-master-data-companies/contract";
import type { WorkspaceNavTeam } from "@repo/ui/components/compose/workspace";
import { WorkspaceNavTeamSwitcher } from "@repo/ui/components/compose/workspace";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

export function AuthenticatedCompanySwitcher(): ReactElement | null {
  const router = useRouter();
  const [activeTeamId, setActiveTeamId] = useState<string | undefined>();
  const [teams, setTeams] = useState<readonly WorkspaceNavTeam[]>([LOADING_TEAM]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCompanies = async (): Promise<void> => {
      try {
        const [companiesResponse, activeResponse] = await Promise.all([
          fetch("/api/companies?pageSize=100"),
          fetch("/api/companies/active"),
        ]);

        if (cancelled) {
          return;
        }

        if (!companiesResponse.ok) {
          setTeams([]);
          return;
        }

        const companiesPayload = (await companiesResponse.json()) as {
          data?: { items?: Company[] };
        };
        const companyItems = companiesPayload.data?.items ?? [];

        if (companyItems.length === 0) {
          setTeams([]);
          return;
        }

        const mappedTeams = companyItems.map(toWorkspaceTeam);
        setTeams(mappedTeams);

        if (activeResponse.ok) {
          const activePayload = (await activeResponse.json()) as {
            data?: Company;
          };

          if (activePayload.data?.id) {
            setActiveTeamId(activePayload.data.id);
            return;
          }
        }

        setActiveTeamId(mappedTeams[0]?.id);
      } catch {
        if (!cancelled) {
          setTeams([]);
        }
      }
    };

    void loadCompanies();

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
        void handleTeamChange(team);
      }}
      showShortcuts={teams.length > 1 && teams.length <= 9}
      teams={teams}
    />
  );
}
