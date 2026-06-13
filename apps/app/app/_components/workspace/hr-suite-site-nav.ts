import { isPathActive } from "./path-utils.ts";

/** sidebar-15 NavFavorites / NavWorkspaces — emoji span before label. */
export type HrSuiteNavEmojiTone = {
  emoji: string;
};

export type HrSuiteSiteNavItem = {
  /** Compact shortcut card description when promoted as a most-used item. */
  cardDescription?: string;
  /** Compact shortcut card label when promoted as a most-used item. */
  cardLabel?: string;
  /** Nested tree children for folder-style navigation nodes. */
  children?: readonly HrSuiteSiteNavItem[];
  featureId: string;
  /** Human-readable title for page chrome and previews. */
  label: string;
  /** Sidebar + breadcrumb display label. */
  navLabel: string;
  /** Live app route when the feature surface is wired in `apps/app`. */
  liveHref?: string;
  /** Functional metadata used by local navigation search. */
  searchKeywords?: readonly string[];
  /** Short capability summary used only for search matching. */
  searchSummary?: string;
  /** Pinned HR shortcuts — emoji on SidebarMenuButton. */
  emoji?: string;
  /** Curated operator shortcut shown in the site sidebar mini-card grid. */
  isMostUsed?: boolean;
};

export type HrSuiteSiteNavGroup = {
  items: readonly HrSuiteSiteNavItem[];
  navLabel: string;
  searchKeywords?: readonly string[];
  tone: HrSuiteNavEmojiTone;
};

export const HR_SUITE_FEATURE: HrSuiteNavEmojiTone & { navLabel: "HR Suite" } =
  {
    navLabel: "HR Suite",
    emoji: "🎯",
  };

type HrSuiteSiteNavItemOptions = {
  cardDescription?: string;
  cardLabel?: string;
  children?: readonly HrSuiteSiteNavItem[];
  isMostUsed?: boolean;
  liveHref?: string;
  navLabel?: string;
  searchKeywords?: readonly string[];
  searchSummary?: string;
};

const DISPLAY_LABEL_ACRONYMS = new Set(["gps", "hr", "lms", "osha", "ot"]);

function toDisplayLabel(label: string): string {
  return label
    .split(" ")
    .map((word) => {
      if (word === "&") {
        return word;
      }

      return word
        .split("-")
        .map((segment) => {
          const normalizedSegment = segment.toLowerCase();

          if (DISPLAY_LABEL_ACRONYMS.has(normalizedSegment)) {
            return normalizedSegment.toUpperCase();
          }

          return `${normalizedSegment.charAt(0).toUpperCase()}${normalizedSegment.slice(1)}`;
        })
        .join("-");
    })
    .join(" ");
}

function item(
  featureId: string,
  label: string,
  _navLabel: string,
  options: HrSuiteSiteNavItemOptions = {}
): HrSuiteSiteNavItem {
  const displayLabel = toDisplayLabel(label);

  return {
    featureId,
    label: displayLabel,
    navLabel: options.navLabel ?? displayLabel,
    ...options,
  };
}

function shortcut(
  featureId: string,
  label: string,
  _navLabel: string,
  emoji: string,
  options: HrSuiteSiteNavItemOptions = {}
): HrSuiteSiteNavItem {
  const displayLabel = toDisplayLabel(label);

  return {
    featureId,
    label: displayLabel,
    navLabel: options.cardLabel ?? displayLabel,
    emoji,
    ...options,
  };
}

/** Pinned shortcuts directly under HR Suite (not domain collapsibles). */
export const HR_SUITE_SITE_SHORTCUTS: readonly HrSuiteSiteNavItem[] = [
  shortcut("hr-suite.shortcuts.hr-console", "HR Console", "hr_console", "🖥️", {
    cardDescription: "Command center",
    cardLabel: "HR Console",
    isMostUsed: true,
    searchKeywords: ["dashboard", "operations", "workspace", "admin"],
    searchSummary: "Operate HR Suite dashboards and workspace controls.",
  }),
  shortcut(
    "hr-suite.shortcuts.organization-chart",
    "Organization Chart",
    "organization_chart",
    "🏢",
    {
      cardDescription: "Reporting lines",
      cardLabel: "Org Chart",
      isMostUsed: true,
      searchKeywords: ["org chart", "reporting line", "manager", "hierarchy"],
      searchSummary: "Find reporting lines and company hierarchy.",
    }
  ),
  shortcut("hr-suite.shortcuts.seed-book", "Seed Book", "the_seed_book", "📖", {
    cardDescription: "People directory",
    cardLabel: "Seed Book",
    isMostUsed: true,
    searchKeywords: ["directory", "people book", "employee profile"],
    searchSummary: "Browse people records and employee profile references.",
  }),
  shortcut(
    "hr-suite.shortcuts.announcement",
    "Announcements",
    "announcement",
    "📢",
    {
      cardDescription: "Company updates",
      cardLabel: "Announcements",
      isMostUsed: true,
      searchKeywords: ["broadcast", "news", "company update", "notice"],
      searchSummary: "Publish and find workforce announcements.",
    }
  ),
  shortcut("hr-suite.shortcuts.work-flow", "Workflows", "work_flow", "🔄", {
    cardDescription: "Approvals",
    cardLabel: "Workflows",
    isMostUsed: true,
    searchKeywords: ["approval", "process", "automation", "task routing"],
    searchSummary: "Route HR approvals and operational workflows.",
  }),
  shortcut(
    "hr-suite.shortcuts.help-escalation",
    "Help & Escalation",
    "help_escalation",
    "🛟",
    {
      cardDescription: "Support route",
      cardLabel: "Help & Escalation",
      isMostUsed: true,
      searchKeywords: [
        "complaint",
        "grievance",
        "help",
        "support",
        "urgent",
        "escalation",
        "case",
        "employee relations",
      ],
      searchSummary:
        "Route HR help requests, employee relations cases, and escalations.",
    }
  ),
];

export const HR_SUITE_SHORTCUTS_NAV_GROUP: HrSuiteSiteNavGroup = {
  navLabel: "HR Shortcuts",
  tone: { emoji: "📌" },
  items: HR_SUITE_SITE_SHORTCUTS,
};

export const HR_SUITE_SITE_NAV_GROUPS: readonly HrSuiteSiteNavGroup[] = [
  {
    navLabel: "Time & Attendance",
    tone: { emoji: "⏰" },
    searchKeywords: ["time", "attendance", "schedule", "absence", "shift"],
    items: [
      item(
        "hr-suite.time-attendance.leave-attendance-management",
        "Leave attendance management",
        "leave_attendance_management",
        {
          searchKeywords: [
            "pto",
            "vacation",
            "holiday",
            "leave request",
            "absence approval",
            "attendance policy",
          ],
          searchSummary:
            "Manage leave requests, PTO, and attendance approvals.",
        }
      ),
      item(
        "hr-suite.time-attendance.overtime-management",
        "Overtime management",
        "overtime_management",
        {
          searchKeywords: ["ot", "extra hours", "premium pay", "timesheet"],
          searchSummary: "Track overtime requests, extra hours, and approvals.",
        }
      ),
      item(
        "hr-suite.time-attendance.absence-analytics-trends",
        "Absence analytics trends",
        "absence_analytics_trends",
        {
          searchKeywords: ["absence report", "trend", "leave analytics"],
          searchSummary: "Analyze absence patterns and attendance trends.",
        }
      ),
      item(
        "hr-suite.time-attendance.flexible-work-arrangement-tracking",
        "Flexible work arrangement tracking",
        "flexible_work_arrangement_tracking",
        {
          searchKeywords: ["remote work", "hybrid", "flex work", "wfh"],
          searchSummary:
            "Track flexible, remote, and hybrid work arrangements.",
        }
      ),
      item(
        "hr-suite.time-attendance.time-clock-integration",
        "Time clock integration",
        "time_clock_integration",
        {
          searchKeywords: ["clock in", "clock out", "punch", "biometric"],
          searchSummary: "Connect time clock, punch, and attendance devices.",
        }
      ),
      item(
        "hr-suite.time-attendance.shift-scheduling",
        "Shift scheduling",
        "shift_scheduling",
        {
          searchKeywords: ["roster", "schedule", "rota", "coverage"],
          searchSummary: "Plan shifts, rosters, and staffing coverage.",
        }
      ),
      item(
        "hr-suite.time-attendance.geolocation-remote-checkin",
        "Geolocation remote checkin",
        "geolocation_remote_checkin",
        {
          searchKeywords: ["gps", "location", "mobile check in", "field staff"],
          searchSummary: "Verify mobile and remote worker check-ins.",
        }
      ),
    ],
  },
  {
    navLabel: "Employee Management",
    tone: { emoji: "👥" },
    searchKeywords: ["employee", "people", "records", "documents", "profile"],
    items: [
      item(
        "hr-suite.employee-management.documents-management",
        "Documents management",
        "documents_management",
        {
          liveHref: "/hr/documents",
          children: [
            item(
              "hr-suite.employee-management.documents-management",
              "Overview",
              "overview",
              {
                liveHref: "/hr",
                navLabel: "Documents Management",
                searchKeywords: ["home", "overview", "portal", "workspace"],
                searchSummary:
                  "Open the Documents Management overview and route entry.",
              }
            ),
            item(
              "hr-suite.employee-management.documents-management",
              "Document directory",
              "document_directory",
              {
                liveHref: "/hr/documents",
                navLabel: "Documents Management",
                searchKeywords: [
                  "upload",
                  "contract",
                  "certificate",
                  "paperwork",
                  "employee files",
                  "policy documents",
                ],
                searchSummary: "Browse, upload, and manage employee documents.",
              }
            ),
          ],
          searchKeywords: [
            "contract",
            "certificate",
            "paperwork",
            "employee files",
            "policy documents",
          ],
          searchSummary: "Manage employee documents, files, and HR paperwork.",
        }
      ),
      item(
        "hr-suite.employee-management.employee-records-management",
        "Employee records management",
        "employee_records_management",
        {
          searchKeywords: [
            "profile",
            "personal data",
            "job history",
            "records",
          ],
          searchSummary: "Maintain employee master data and profile records.",
        }
      ),
      item(
        "hr-suite.employee-management.employee-selfservice-portal",
        "Employee self-service portal",
        "employee_selfservice_portal",
        {
          searchKeywords: ["self service", "employee portal", "request center"],
          searchSummary: "Let employees access requests and personal HR data.",
        }
      ),
      item(
        "hr-suite.employee-management.employee-lifecycle-management",
        "Employee lifecycle management",
        "employee_lifecycle_management",
        {
          searchKeywords: ["hire", "transfer", "promotion", "termination"],
          searchSummary: "Track employee movement from hire to exit.",
        }
      ),
      item(
        "hr-suite.employee-management.organizational-chart-hierarchy",
        "Organizational chart hierarchy",
        "organizational_chart_hierarchy",
        {
          searchKeywords: ["org chart", "manager", "reporting structure"],
          searchSummary:
            "Navigate reporting hierarchy and organization charts.",
        }
      ),
      item(
        "hr-suite.employee-management.compliance-regulatory-tracking",
        "Compliance regulatory tracking",
        "compliance_regulatory_tracking",
        {
          searchKeywords: ["compliance", "regulation", "audit", "policy"],
          searchSummary:
            "Track employee compliance and regulatory obligations.",
        }
      ),
      item(
        "hr-suite.employee-management.offboarding-exit-management",
        "Offboarding exit management",
        "offboarding_exit_management",
        {
          searchKeywords: ["exit", "resignation", "termination", "clearance"],
          searchSummary:
            "Coordinate exit, offboarding, and clearance workflows.",
        }
      ),
    ],
  },
  {
    navLabel: "Industry Specific",
    tone: { emoji: "🏭" },
    searchKeywords: ["industry", "compliance", "workforce", "certification"],
    items: [
      item(
        "hr-suite.industry-specific.union-management",
        "Union management",
        "union_management",
        {
          searchKeywords: ["collective agreement", "union", "labor relations"],
          searchSummary: "Manage union and labor relations requirements.",
        }
      ),
      item(
        "hr-suite.industry-specific.food-handler-certification-health-compliance",
        "Food handler certification",
        "food_handler_certification",
        {
          searchKeywords: ["health card", "food safety", "certification"],
          searchSummary:
            "Track food handler certification and health compliance.",
        }
      ),
      item(
        "hr-suite.industry-specific.field-worker-remote-workforce-management",
        "Field worker remote workforce",
        "field_worker_remote_workforce",
        {
          searchKeywords: ["field staff", "remote workforce", "mobile worker"],
          searchSummary:
            "Manage field workers and distributed workforce records.",
        }
      ),
      item(
        "hr-suite.industry-specific.government-classification-pay-grades",
        "Government classification pay grades",
        "government_classification_pay_grades",
        {
          searchKeywords: ["civil service", "pay grade", "classification"],
          searchSummary: "Track government classifications and pay grades.",
        }
      ),
      item(
        "hr-suite.industry-specific.retail-seasonal-hourly-workforce-scheduling",
        "Retail seasonal hourly scheduling",
        "retail_seasonal_hourly_scheduling",
        {
          searchKeywords: ["retail", "seasonal", "hourly", "coverage"],
          searchSummary: "Schedule retail, seasonal, and hourly workforces.",
        }
      ),
      item(
        "hr-suite.industry-specific.manufacturing-safety-training-osha-compliance",
        "Manufacturing safety training",
        "manufacturing_safety_training",
        {
          searchKeywords: ["osha", "safety", "training", "manufacturing"],
          searchSummary:
            "Track manufacturing safety training and OSHA compliance.",
        }
      ),
    ],
  },
  {
    navLabel: "Payroll & Compensation",
    tone: { emoji: "💰" },
    searchKeywords: ["payroll", "pay", "salary", "benefits", "compensation"],
    items: [
      item(
        "hr-suite.payroll-compensation.payroll-processing",
        "Payroll processing",
        "payroll_processing",
        {
          searchKeywords: ["pay run", "salary", "wages", "payslip"],
          searchSummary: "Run payroll, salary, wages, and payslip processing.",
        }
      ),
      item(
        "hr-suite.payroll-compensation.benefits-administration",
        "Benefits administration",
        "benefits_administration",
        {
          searchKeywords: ["insurance", "benefit", "enrollment", "allowance"],
          searchSummary: "Administer employee benefits and enrollments.",
        }
      ),
      item(
        "hr-suite.payroll-compensation.expenses-reimbursement",
        "Expenses reimbursement",
        "expenses_reimbursement",
        {
          searchKeywords: ["claim", "expense", "reimburse", "receipt"],
          searchSummary: "Process expense claims and reimbursements.",
        }
      ),
      item(
        "hr-suite.payroll-compensation.multi-country-payroll",
        "Multi-country payroll",
        "multi_country_payroll",
        {
          searchKeywords: ["global payroll", "localization", "country pay"],
          searchSummary: "Coordinate payroll across countries and local rules.",
        }
      ),
      item(
        "hr-suite.payroll-compensation.bonus-incentive-management",
        "Bonus incentive management",
        "bonus_incentive_management",
        {
          searchKeywords: ["bonus", "commission", "incentive", "variable pay"],
          searchSummary: "Manage bonuses, incentives, and variable pay.",
        }
      ),
      item(
        "hr-suite.payroll-compensation.compensation-planning-modeling",
        "Compensation planning modeling",
        "compensation_planning_modeling",
        {
          searchKeywords: ["salary planning", "budget", "comp review"],
          searchSummary: "Model compensation plans, budgets, and reviews.",
        }
      ),
      item(
        "hr-suite.payroll-compensation.salary-benchmarking-survey",
        "Salary benchmarking survey",
        "salary_benchmarking_survey",
        {
          searchKeywords: ["market pay", "benchmark", "survey", "salary range"],
          searchSummary:
            "Compare salary benchmarks and market pay survey data.",
        }
      ),
    ],
  },
  {
    navLabel: "Talent Management",
    tone: { emoji: "🎓" },
    searchKeywords: ["talent", "recruiting", "training", "performance"],
    items: [
      item(
        "hr-suite.talent-management.recruitment-onboarding",
        "Recruitment onboarding",
        "recruitment_onboarding",
        {
          searchKeywords: ["hiring", "candidate", "onboarding", "new hire"],
          searchSummary: "Manage hiring, candidates, and onboarding.",
        }
      ),
      item(
        "hr-suite.talent-management.performance-appraisals",
        "Performance appraisals",
        "performance_appraisals",
        {
          searchKeywords: ["review", "appraisal", "performance", "rating"],
          searchSummary: "Run performance reviews and appraisal cycles.",
        }
      ),
      item(
        "hr-suite.talent-management.succession-planning",
        "Succession planning",
        "succession_planning",
        {
          searchKeywords: [
            "successor",
            "bench",
            "critical role",
            "talent pool",
          ],
          searchSummary: "Plan successors and critical role coverage.",
        }
      ),
      item(
        "hr-suite.talent-management.training-development",
        "Training development",
        "training_development",
        {
          searchKeywords: ["learning", "course", "development", "training"],
          searchSummary: "Manage training and employee development.",
        }
      ),
      item(
        "hr-suite.talent-management.candidate-selfservice-portal",
        "Candidate self-service portal",
        "candidate_selfservice_portal",
        {
          searchKeywords: ["candidate portal", "applicant", "recruitment"],
          searchSummary: "Give candidates access to application workflows.",
        }
      ),
      item(
        "hr-suite.talent-management.career-pathing-development-plans",
        "Career pathing development plans",
        "career_pathing_development_plans",
        {
          searchKeywords: ["career path", "growth plan", "development plan"],
          searchSummary: "Plan career paths and employee growth plans.",
        }
      ),
      item(
        "hr-suite.talent-management.competency-skills-framework",
        "Competency skills framework",
        "competency_skills_framework",
        {
          searchKeywords: ["skill", "competency", "capability", "framework"],
          searchSummary: "Map skills, competencies, and capability frameworks.",
        }
      ),
      item(
        "hr-suite.talent-management.employee-engagement-surveys",
        "Employee engagement surveys",
        "employee_engagement_surveys",
        {
          searchKeywords: ["survey", "engagement", "pulse", "sentiment"],
          searchSummary: "Measure employee engagement and pulse sentiment.",
        }
      ),
      item(
        "hr-suite.talent-management.learning-management-system-lms",
        "Learning management system",
        "learning_management_system",
        {
          searchKeywords: ["lms", "course", "learning", "training catalog"],
          searchSummary: "Manage LMS content, courses, and learning records.",
        }
      ),
    ],
  },
] as const;

export const HR_SUITE_SITE_NAV_ITEMS = [
  ...HR_SUITE_SITE_SHORTCUTS,
  ...HR_SUITE_SITE_NAV_GROUPS.flatMap((group) =>
    flattenHrSuiteSiteNavItems(group.items)
  ),
];

export const HR_SUITE_DEFAULT_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

function flattenHrSuiteSiteNavItems(
  items: readonly HrSuiteSiteNavItem[]
): readonly HrSuiteSiteNavItem[] {
  return items.flatMap((item) => [
    item,
    ...flattenHrSuiteSiteNavItems(item.children ?? []),
  ]);
}

export function resolveHrSuiteSiteNavItem(
  featureId: string
): HrSuiteSiteNavItem | undefined {
  return HR_SUITE_SITE_NAV_ITEMS.find((item) => item.featureId === featureId);
}

export function resolveHrSuiteSiteNavGroup(
  featureId: string
): HrSuiteSiteNavGroup | undefined {
  if (HR_SUITE_SITE_SHORTCUTS.some((entry) => entry.featureId === featureId)) {
    return HR_SUITE_SHORTCUTS_NAV_GROUP;
  }

  return HR_SUITE_SITE_NAV_GROUPS.find((group) =>
    flattenHrSuiteSiteNavItems(group.items).some(
      (item) => item.featureId === featureId
    )
  );
}

export function resolveHrSuiteFeatureFromPathname(pathname: string):
  | {
      feature: HrSuiteSiteNavItem;
      group: HrSuiteSiteNavGroup;
    }
  | undefined {
  const wiredMatches = HR_SUITE_SITE_NAV_ITEMS.filter(
    (item) => item.liveHref && isPathActive(pathname, item.liveHref)
  );

  const feature =
    wiredMatches.sort(
      (a, b) => (b.liveHref?.length ?? 0) - (a.liveHref?.length ?? 0)
    )[0] ??
    (pathname.startsWith("/hr")
      ? resolveHrSuiteSiteNavItem(HR_SUITE_DEFAULT_FEATURE_ID)
      : undefined);

  if (!feature) {
    return;
  }

  const group = resolveHrSuiteSiteNavGroup(feature.featureId);
  if (!group) {
    return;
  }

  return { feature, group };
}

export function isHrSuitePath(pathname: string): boolean {
  return pathname === "/hr" || pathname.startsWith("/hr/");
}

export type HrSuiteSiteNavSearchGroup = HrSuiteSiteNavGroup & {
  items: readonly HrSuiteSiteNavItem[];
};

export type HrSuiteSiteNavSearchResult = {
  bestItem?: HrSuiteSiteNavItem;
  groups: readonly HrSuiteSiteNavSearchGroup[];
  isSearching: boolean;
  query: string;
  resultCount: number;
  shortcuts: readonly HrSuiteSiteNavItem[];
};

type ScoredItem = {
  item: HrSuiteSiteNavItem;
  score: number;
};

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_./-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzySubsequenceScore(query: string, candidate: string): number {
  let queryIndex = 0;

  for (const character of candidate) {
    if (character === query[queryIndex]) {
      queryIndex += 1;
    }

    if (queryIndex === query.length) {
      return Math.max(20, 42 - Math.max(0, candidate.length - query.length));
    }
  }

  return 0;
}

function scoreCandidate(query: string, candidate: string): number {
  const normalizedCandidate = normalizeSearchValue(candidate);

  if (!(query && normalizedCandidate)) {
    return 0;
  }

  if (normalizedCandidate === query) {
    return 120;
  }

  if (normalizedCandidate.startsWith(query)) {
    return 100;
  }

  const words = normalizedCandidate.split(" ");

  if (words.some((word) => word.startsWith(query))) {
    return 86;
  }

  if (normalizedCandidate.includes(query)) {
    return 72;
  }

  const queryTerms = query.split(" ");
  if (queryTerms.every((term) => normalizedCandidate.includes(term))) {
    return 58 + queryTerms.length * 4;
  }

  if (query.length < 4) {
    return 0;
  }

  return fuzzySubsequenceScore(query.replace(/\s/g, ""), normalizedCandidate);
}

function itemSearchCandidates(
  item: HrSuiteSiteNavItem,
  group?: HrSuiteSiteNavGroup
): readonly string[] {
  return [
    item.label,
    item.navLabel,
    item.featureId,
    item.liveHref ?? "",
    item.searchSummary ?? "",
    ...(item.searchKeywords ?? []),
    group?.navLabel ?? "",
    ...(group?.searchKeywords ?? []),
    HR_SUITE_FEATURE.navLabel,
  ];
}

function scoreItem(
  query: string,
  item: HrSuiteSiteNavItem,
  group?: HrSuiteSiteNavGroup
): number {
  return Math.max(
    ...itemSearchCandidates(item, group).map((candidate) =>
      scoreCandidate(query, candidate)
    )
  );
}

function groupMatchesQuery(query: string, group: HrSuiteSiteNavGroup): boolean {
  return (
    Math.max(
      scoreCandidate(query, group.navLabel),
      ...((group.searchKeywords ?? []).map((candidate) =>
        scoreCandidate(query, candidate)
      ) ?? [])
    ) > 0
  );
}

export function resolveHrSuiteSiteNavSearch(
  rawQuery: string
): HrSuiteSiteNavSearchResult {
  const query = normalizeSearchValue(rawQuery);

  if (!query) {
    return {
      groups: HR_SUITE_SITE_NAV_GROUPS,
      isSearching: false,
      query: "",
      resultCount: HR_SUITE_SITE_NAV_ITEMS.length,
      shortcuts: HR_SUITE_SITE_SHORTCUTS,
    };
  }

  const shortcutScores: ScoredItem[] = HR_SUITE_SITE_SHORTCUTS.map((entry) => ({
    item: entry,
    score: scoreItem(query, entry, HR_SUITE_SHORTCUTS_NAV_GROUP),
  })).filter(({ score }) => score > 0);

  const groupScores = HR_SUITE_SITE_NAV_GROUPS.map((group) => {
    const groupMatch = groupMatchesQuery(query, group);
    const scoredItems = group.items
      .map((entry) => ({
        item: entry,
        score: scoreItem(query, entry, group),
      }))
      .filter(({ score }) => score > 0);

    return {
      group,
      groupMatch,
      scoredItems,
    };
  });

  const scoredItems = [
    ...shortcutScores,
    ...groupScores.flatMap(({ scoredItems }) => scoredItems),
  ].sort((a, b) => b.score - a.score);

  const bestItem = scoredItems[0]?.item;
  const matchedFeatureIds = new Set(
    scoredItems.map(({ item: scoredItem }) => scoredItem.featureId)
  );

  const visibleShortcuts = HR_SUITE_SITE_SHORTCUTS.filter(
    (entry) =>
      matchedFeatureIds.has(entry.featureId) &&
      entry.featureId !== bestItem?.featureId
  );

  const visibleGroups = groupScores
    .map(({ group, groupMatch }) => {
      const items = group.items.filter((entry) => {
        if (entry.featureId === bestItem?.featureId) {
          return false;
        }

        const descendantMatch = flattenHrSuiteSiteNavItems(
          entry.children ?? []
        ).some((child) => matchedFeatureIds.has(child.featureId));

        return (
          groupMatch ||
          matchedFeatureIds.has(entry.featureId) ||
          descendantMatch
        );
      });

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  return {
    bestItem,
    groups: visibleGroups,
    isSearching: true,
    query,
    resultCount: scoredItems.length,
    shortcuts: visibleShortcuts,
  };
}
