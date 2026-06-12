export type OrbitTrailPressure =
  | "routine"
  | "important"
  | "urgent"
  | "critical";

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
};

export const ORBIT_TRAIL_STORAGE_KEY = "xforge.orbitTrail.v1";
export const ORBIT_TRAIL_VISIBLE_LIMIT = 10;
export const ORBIT_TRAIL_FOCUS_EVENT = "xforge:orbit-trail-focus";

const pressureRank: Record<OrbitTrailPressure, number> = {
  critical: 3,
  urgent: 2,
  important: 1,
  routine: 0,
};

export function isOrbitTrailAddSyntax(input: string): boolean {
  const trimmed = input.trim();

  return (
    /(^|\s)@\S+/.test(trimmed) ||
    /(^|\s)\/\S+/.test(trimmed) ||
    /(^|\s)#\S+/.test(trimmed) ||
    /(^|\s)!{1,3}(\s|$)/.test(trimmed)
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
  let pressure: OrbitTrailPressure = "routine";
  const titleParts: string[] = [];

  for (const token of tokens) {
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
      continue;
    }

    titleParts.push(normalizeFreeText(token));
  }

  const normalizedScope = scope || "general";
  const title = [actor, scope, ...titleParts]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!title) {
    return null;
  }

  return {
    pressure,
    rawInput,
    scope: normalizedScope,
    scopeKind: inferScopeKind(normalizedScope),
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
    id: `orbit-trail-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.toISOString(),
    done: false,
    pinned: false,
    pressure: parsed.pressure,
    rawInput: parsed.rawInput,
    scope: parsed.scope,
    scopeKind: parsed.scopeKind,
    title: parsed.title,
  };
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
