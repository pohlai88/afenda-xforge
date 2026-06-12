export type OrbitTrailPressure =
  | "routine"
  | "important"
  | "urgent"
  | "critical";

export type OrbitSyntaxKind = "who" | "pressure" | "where" | "when";

export type OrbitSyntaxSymbol = "@" | "!" | "/" | "#";

export type OrbitTrailScopeKind =
  | "module"
  | "project"
  | "workspace"
  | "route"
  | "unknown";

export type OrbitTrailItem = {
  id: string;
  title: string;
  rawInput: string;
  syntaxKind: OrbitSyntaxKind;
  syntaxSymbol: OrbitSyntaxSymbol;
  syntaxValue: string;
  scope: string;
  scopeKind?: OrbitTrailScopeKind;
  pressure: OrbitTrailPressure;
  createdAt: string;
  pinned: boolean;
  done: boolean;
};

export type ParsedOrbitTrailInput = {
  title: string;
  rawInput: string;
  scope: string;
  scopeKind: OrbitTrailScopeKind;
  pressure: OrbitTrailPressure;
  syntaxKind: OrbitSyntaxKind;
  syntaxSymbol: OrbitSyntaxSymbol;
  syntaxValue: string;
};

export const ORBIT_TRAIL_STORAGE_KEY = "xforge.orbitTrail.v1";
export const ORBIT_TRAIL_PINNED_LIMIT = 3;
export const ORBIT_TRAIL_TAB_LIMIT = 10;
export const ORBIT_TRAIL_MATRIX_LIMIT = 30;

export type OrbitMatrixTabId = "guide" | OrbitTrailPressure;
/** @deprecated Use ORBIT_TRAIL_TAB_LIMIT */
export const ORBIT_TRAIL_NORMAL_LIMIT = ORBIT_TRAIL_TAB_LIMIT;
export const ORBIT_TRAIL_FOCUS_EVENT = "xforge:orbit-trail-focus";

export const ORBIT_TRAIL_PRESSURE_SYNTAX: Record<OrbitTrailPressure, string> =
  {
    critical: "!C",
    important: "!M",
    routine: "R",
    urgent: "!U",
  };

export const ORBIT_EISENHOWER_TABS = [
  { label: "!M", pressure: "important", syntax: "!M" },
  { label: "!U", pressure: "urgent", syntax: "!U" },
  { label: "!C", pressure: "critical", syntax: "!C" },
] as const satisfies readonly {
  label: string;
  pressure: OrbitTrailPressure;
  syntax: string;
}[];

export const ORBIT_SYNTAX_GUIDE_EXAMPLE = {
  input: "@RHB !C /AP #15/05",
  output: "RHB Bank critical check Account Payable before 15May",
} as const;

export const ORBIT_SYNTAX_GUIDE_LINES = [
  { meaning: "who / what", symbol: "@" },
  { meaning: "important, not urgent", symbol: "!M" },
  { meaning: "urgent, not important", symbol: "!U" },
  { meaning: "urgent + important", symbol: "!C" },
  { meaning: "where", symbol: "/" },
  { meaning: "when", symbol: "#" },
] as const satisfies readonly {
  meaning: string;
  symbol: string;
}[];

export const ORBIT_SYNTAX_TABS = [
  { kind: "who", label: "@ Who / What", symbol: "@" },
  { kind: "pressure", label: "Pressure", symbol: "!" },
  { kind: "where", label: "Where", symbol: "/" },
  { kind: "when", label: "When", symbol: "#" },
] as const satisfies readonly {
  kind: OrbitSyntaxKind;
  label: string;
  symbol: OrbitSyntaxSymbol;
}[];

export const ORBIT_TRAIL_PRESSURE_DOT_CLASS: Record<OrbitTrailPressure, string> =
  {
    critical: "bg-red-500",
    important: "bg-sky-500",
    routine: "bg-muted-foreground/45",
    urgent: "bg-amber-500",
  };

const pressureRank: Record<OrbitTrailPressure, number> = {
  critical: 3,
  urgent: 2,
  important: 1,
  routine: 0,
};

const syntaxSymbolByKind: Record<OrbitSyntaxKind, OrbitSyntaxSymbol> = {
  pressure: "!",
  when: "#",
  where: "/",
  who: "@",
};

export function isOrbitTrailAddSyntax(input: string): boolean {
  const trimmed = input.trim();

  return (
    /(^|\s)@\S+/.test(trimmed) ||
    /(^|\s)\/\S+/.test(trimmed) ||
    /(^|\s)#\S+/.test(trimmed) ||
    /(^|\s)!{1,3}(\s|$)/.test(trimmed) ||
    trimmed.length > 0
  );
}

export function parseOrbitTrailInput(
  input: string
): ParsedOrbitTrailInput | null {
  const rawInput = input.trim();
  if (!rawInput) {
    return null;
  }

  const tokens = rawInput.split(/\s+/);
  let actor = "";
  let scope = "";
  let when = "";
  let pressure: OrbitTrailPressure = "routine";
  const titleParts: string[] = [];

  for (const token of tokens) {
    if (token === "R") {
      pressure = "routine";
      continue;
    }

    if (token === "!M" || token === "!I") {
      pressure = "important";
      continue;
    }

    if (token === "!U") {
      pressure = "urgent";
      continue;
    }

    if (token === "!C") {
      pressure = "critical";
      continue;
    }

    if (/^!{1,3}$/.test(token)) {
      pressure = parsePressureToken(token);
      continue;
    }

    if (token.startsWith("@") && token.length > 1) {
      actor = normalizeActorLabel(token.slice(1));
      continue;
    }

    if (token.startsWith("/") && token.length > 1) {
      scope = normalizeScopeLabel(token.slice(1));
      continue;
    }

    if (token.startsWith("#") && token.length > 1) {
      when = normalizeFreeText(token.slice(1));
      continue;
    }

    titleParts.push(normalizeFreeText(token));
  }

  const normalizedScope = scope || "general";
  const title = [actor, scope, when, ...titleParts]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!title) {
    return null;
  }

  const syntax = resolveSyntaxMetadata({
    actor,
    pressure,
    scope: normalizedScope,
    title,
    when,
  });

  return {
    pressure,
    rawInput,
    scope: normalizedScope,
    scopeKind: inferScopeKind(normalizedScope),
    syntaxKind: syntax.syntaxKind,
    syntaxSymbol: syntax.syntaxSymbol,
    syntaxValue: syntax.syntaxValue,
    title,
  };
}

export function createOrbitTrailItem(
  input: string,
  now = new Date()
): OrbitTrailItem | null {
  const parsed = parseOrbitTrailInput(input);
  if (!parsed) {
    return null;
  }

  return {
    createdAt: now.toISOString(),
    done: false,
    id: `orbit-trail-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    pinned: false,
    pressure: parsed.pressure,
    rawInput: parsed.rawInput,
    scope: parsed.scope,
    scopeKind: parsed.scopeKind,
    syntaxKind: parsed.syntaxKind,
    syntaxSymbol: parsed.syntaxSymbol,
    syntaxValue: parsed.syntaxValue,
    title: parsed.title,
  };
}

export function partitionSyntaxPanelItems(
  items: readonly OrbitTrailItem[],
  syntaxKind: OrbitSyntaxKind
): { normal: OrbitTrailItem[]; pinned: OrbitTrailItem[] } {
  const openItems = items.filter(
    (item) => !item.done && item.syntaxKind === syntaxKind
  );
  const sortedItems = sortOrbitTrailItems(openItems);

  return {
    normal: sortedItems
      .filter((item) => !item.pinned)
      .slice(0, ORBIT_TRAIL_NORMAL_LIMIT),
    pinned: sortedItems
      .filter((item) => item.pinned)
      .slice(0, ORBIT_TRAIL_PINNED_LIMIT),
  };
}

export function countOpenOrbitTrailItems(
  items: readonly OrbitTrailItem[]
): number {
  return items.filter((item) => !item.done).length;
}

export function countMatrixOrbitTrailItems(
  items: readonly OrbitTrailItem[]
): number {
  return items.filter(
    (item) => !item.done && item.pressure !== "routine"
  ).length;
}

export function isOrbitMatrixPressureTab(
  tab: OrbitMatrixTabId
): tab is OrbitTrailPressure {
  return tab !== "guide";
}

export function countOpenOrbitTrailItemsByPressure(
  items: readonly OrbitTrailItem[],
  pressure: OrbitTrailPressure
): number {
  return items.filter((item) => !item.done && item.pressure === pressure).length;
}

export function partitionPressurePanelItems(
  items: readonly OrbitTrailItem[],
  pressure: OrbitTrailPressure
): { normal: OrbitTrailItem[]; pinned: OrbitTrailItem[] } {
  const openItems = items.filter(
    (item) => !item.done && item.pressure === pressure
  );
  const sortedItems = sortOrbitTrailItems(openItems);
  const pinned = sortedItems
    .filter((item) => item.pinned)
    .slice(0, ORBIT_TRAIL_PINNED_LIMIT);
  const normalLimit = Math.max(0, ORBIT_TRAIL_TAB_LIMIT - pinned.length);

  return {
    normal: sortedItems
      .filter((item) => !item.pinned)
      .slice(0, normalLimit),
    pinned,
  };
}

export function canPinSyntaxItem(
  items: readonly OrbitTrailItem[],
  syntaxKind: OrbitSyntaxKind,
  itemId: string
): boolean {
  const item = items.find((entry) => entry.id === itemId);
  if (!item || item.pinned) {
    return true;
  }

  const pinnedCount = items.filter(
    (entry) =>
      !entry.done &&
      entry.syntaxKind === syntaxKind &&
      entry.pinned &&
      entry.id !== itemId
  ).length;

  return pinnedCount < ORBIT_TRAIL_PINNED_LIMIT;
}

export function canPinPressureItem(
  items: readonly OrbitTrailItem[],
  pressure: OrbitTrailPressure,
  itemId: string
): boolean {
  const item = items.find((entry) => entry.id === itemId);
  if (!item || item.pinned) {
    return true;
  }

  const pinnedCount = items.filter(
    (entry) =>
      !entry.done &&
      entry.pressure === pressure &&
      entry.pinned &&
      entry.id !== itemId
  ).length;

  return pinnedCount < ORBIT_TRAIL_PINNED_LIMIT;
}

export function applyActivePressurePrefix(
  input: string,
  pressure: OrbitTrailPressure
): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (hasExplicitPressureSyntax(trimmed)) {
    return trimmed;
  }

  return `${ORBIT_TRAIL_PRESSURE_SYNTAX[pressure]} ${trimmed}`;
}

export function sortOrbitTrailItems(
  items: readonly OrbitTrailItem[]
): OrbitTrailItem[] {
  return [...items].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    const pressureDelta =
      pressureRank[right.pressure] - pressureRank[left.pressure];
    if (pressureDelta !== 0) {
      return pressureDelta;
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}

export function formatOrbitTrailAge(
  createdAt: string,
  now = new Date()
): string {
  const created = new Date(createdAt).getTime();
  const deltaMs = Math.max(0, now.getTime() - created);
  const minutes = Math.max(1, Math.floor(deltaMs / 60_000));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  return `${Math.floor(hours / 24)}d`;
}

export function migrateLegacyOrbitTrailItem(
  value: Partial<OrbitTrailItem>
): OrbitTrailItem | null {
  if (
    !value.id ||
    !value.title ||
    !value.rawInput ||
    !value.scope ||
    !value.createdAt ||
    typeof value.pinned !== "boolean" ||
    typeof value.done !== "boolean" ||
    !value.pressure
  ) {
    return null;
  }

  if (value.syntaxKind && value.syntaxSymbol && value.syntaxValue) {
    return value as OrbitTrailItem;
  }

  const parsed = parseOrbitTrailInput(value.rawInput);
  if (!parsed) {
    const fallbackSyntax = resolveSyntaxMetadata({
      actor: "",
      pressure: value.pressure,
      scope: value.scope,
      title: value.title,
      when: "",
    });

    return {
      createdAt: value.createdAt,
      done: value.done,
      id: value.id,
      pinned: value.pinned,
      pressure: value.pressure,
      rawInput: value.rawInput,
      scope: value.scope,
      scopeKind: value.scopeKind,
      syntaxKind: fallbackSyntax.syntaxKind,
      syntaxSymbol: fallbackSyntax.syntaxSymbol,
      syntaxValue: fallbackSyntax.syntaxValue,
      title: value.title,
    };
  }

  return {
    createdAt: value.createdAt,
    done: value.done,
    id: value.id,
    pinned: value.pinned,
    pressure: parsed.pressure,
    rawInput: value.rawInput,
    scope: parsed.scope,
    scopeKind: parsed.scopeKind,
    syntaxKind: parsed.syntaxKind,
    syntaxSymbol: parsed.syntaxSymbol,
    syntaxValue: parsed.syntaxValue,
    title: parsed.title,
  };
}

function resolveSyntaxMetadata({
  actor,
  pressure,
  scope,
  title,
  when,
}: {
  actor: string;
  pressure: OrbitTrailPressure;
  scope: string;
  title: string;
  when: string;
}): {
  syntaxKind: OrbitSyntaxKind;
  syntaxSymbol: OrbitSyntaxSymbol;
  syntaxValue: string;
} {
  if (actor) {
    return { syntaxKind: "who", syntaxSymbol: "@", syntaxValue: actor };
  }

  if (pressure !== "routine") {
    return {
      syntaxKind: "pressure",
      syntaxSymbol: "!",
      syntaxValue: pressure,
    };
  }

  if (scope !== "general") {
    return { syntaxKind: "where", syntaxSymbol: "/", syntaxValue: scope };
  }

  if (when) {
    return { syntaxKind: "when", syntaxSymbol: "#", syntaxValue: when };
  }

  return { syntaxKind: "who", syntaxSymbol: "@", syntaxValue: title };
}

function hasExplicitPressureSyntax(input: string): boolean {
  return /(^|\s)(R|!M|!I|!U|!C|!{1,3})(\s|$)/.test(input.trim());
}

function parsePressureToken(token: string): OrbitTrailPressure {
  if (token === "!!!") {
    return "critical";
  }
  if (token === "!!") {
    return "urgent";
  }
  if (token === "!") {
    return "important";
  }

  return "routine";
}

function normalizeActorLabel(value: string): string {
  const titleCased = value
    .replace(/[-_]+/g, " ")
    .replace(/[^\w\s./]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return titleCased.replace(/\bChatgpt\b/g, "ChatGPT");
}

function normalizeScopeLabel(value: string): string {
  return value
    .replace(/[^\w\s./-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFreeText(value: string): string {
  return value
    .replace(/[^\w\s./-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferScopeKind(scope: string): OrbitTrailScopeKind {
  if (scope.includes("/")) {
    return "route";
  }

  const normalized = scope.toLowerCase();
  if (
    ["finance ops", "sales ops", "hr ops", "workspace"].includes(normalized)
  ) {
    return "workspace";
  }

  if (["payment", "finance", "hr", "audit", "documents"].includes(normalized)) {
    return "module";
  }

  if (normalized.startsWith("afenda")) {
    return "project";
  }

  return "unknown";
}

export function isOrbitTrailItem(value: unknown): value is OrbitTrailItem {
  if (!(value && typeof value === "object")) {
    return false;
  }

  const migrated = migrateLegacyOrbitTrailItem(value as Partial<OrbitTrailItem>);
  return migrated !== null;
}

const ORBIT_MATRIX_ONBOARDING_INPUTS = [
  "!M quarterly planning review",
  "!U client follow-up today",
  "@RHB !C /AP payment check",
] as const;

export function createOrbitMatrixOnboardingItems(
  now = new Date()
): OrbitTrailItem[] {
  return ORBIT_MATRIX_ONBOARDING_INPUTS.flatMap((rawInput, index) => {
    const parsed = createOrbitTrailItem(
      rawInput,
      new Date(now.getTime() - index * 3_600_000)
    );

    if (!parsed) {
      return [];
    }

    return [
      {
        ...parsed,
        id: `orbit-onboard-${parsed.pressure}`,
      },
    ];
  });
}

export function readStoredOrbitTrailItems(): OrbitTrailItem[] {
  try {
    const stored = window.localStorage.getItem(ORBIT_TRAIL_STORAGE_KEY);
    if (!stored) {
      return createOrbitMatrixOnboardingItems();
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return createOrbitMatrixOnboardingItems();
    }

    if (parsed.length === 0) {
      return createOrbitMatrixOnboardingItems();
    }

    return parsed
      .map((entry) => migrateLegacyOrbitTrailItem(entry as Partial<OrbitTrailItem>))
      .filter((entry): entry is OrbitTrailItem => entry !== null);
  } catch {
    return createOrbitMatrixOnboardingItems();
  }
}

export function syntaxKindLabel(kind: OrbitSyntaxKind): string {
  return ORBIT_SYNTAX_TABS.find((tab) => tab.kind === kind)?.label ?? kind;
}

export function syntaxSymbolForKind(kind: OrbitSyntaxKind): OrbitSyntaxSymbol {
  return syntaxSymbolByKind[kind];
}
