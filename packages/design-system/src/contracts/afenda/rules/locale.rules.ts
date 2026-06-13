import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const LOCALE = "locale" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_LOCALE_RULES = [
  {
    id: "locale.tenant-locale-policy",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["tenant-setting", "company-setting", "user-preference", "app-shell", "report"],
    rationale:
      "Enterprise locale behavior must resolve predictably between user preference, tenant default, company region, and legal reporting requirements.",
    requirement:
      "Locale resolution must follow an explicit precedence policy.",
    remediation:
      "Resolve locale from user preference, tenant/company default, route locale, and system fallback through the approved locale policy.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:tenant-context-contract",
      "AFENDA:execution-context-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.route-locale-consistency",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["route", "link", "redirect", "middleware", "locale-switcher", "navigation"],
    rationale:
      "Locale state must remain stable across navigation, redirects, deep links, and shared URLs.",
    requirement:
      "Routes, links, redirects, and locale switchers must preserve the active locale intentionally.",
    remediation:
      "Use locale-aware routing helpers and include locale state in generated links, redirects, and canonical URLs.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:navigation-contract",
      "AFENDA:route-state-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.translation-key-contract",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["text", "label", "button", "toast", "error-message", "empty-state"],
    forbidden: ["inline user-facing string without translation key", "string concatenation for translated UI"],
    rationale:
      "User-facing strings need stable translation keys so localization can be reviewed, versioned, and reused.",
    requirement:
      "Localizable strings must use approved translation keys and structured message parameters.",
    remediation:
      "Move user-facing copy into the locale message contract and pass dynamic values as named parameters.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:content-contract",
      "AFENDA:message-catalog-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.pluralization-and-grammar",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["count", "badge", "summary", "toast", "empty-state", "table-footer"],
    forbidden: ["count + hard-coded singular noun", "manual plural suffix", "English-only grammar assembly"],
    rationale:
      "Plural and grammatical forms vary by language and cannot be assembled safely with English string rules.",
    requirement:
      "Count-dependent messages must use locale-aware plural and grammar handling.",
    remediation:
      "Use message templates with plural/select branches or Intl.PluralRules through the approved i18n adapter.",
    references: ["AFENDA:locale-contract", "AFENDA:message-catalog-contract"],
    enforcement: HYBRID,
  },
  {
    id: "locale.intl-formatting",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["date", "time", "number", "currency", "percent", "unit"],
    forbidden: ["hard-coded date format", "hard-coded currency format", "hard-coded decimal separator"],
    rationale:
      "Locale-sensitive formatting must respect user language, region, numbering, and currency conventions.",
    requirement:
      "Dates, times, numbers, percentages, units, and currencies must use Intl or approved locale formatting primitives.",
    remediation:
      "Use Intl.DateTimeFormat, Intl.NumberFormat, Intl.PluralRules, and explicit locale/currency options.",
    references: ["AFENDA:locale-contract", "AFENDA:content-contract"],
    enforcement: STATIC,
  },
  {
    id: "locale.input-parsing-explicitness",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["date-input", "number-input", "currency-input", "unit-input", "form-field"],
    forbidden: ["ambiguous localized input parsing", "viewer-locale-only financial parsing"],
    rationale:
      "Localized display and localized input parsing are different risks; ambiguous parsing can corrupt enterprise data.",
    requirement:
      "Locale-sensitive inputs must parse through explicit locale, currency, unit, and validation policy.",
    remediation:
      "Use governed input adapters, show accepted format hints, and normalize values before mutation.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:forms-contract",
      "AFENDA:validation-contract",
      "AFENDA:mutation-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.timezone-explicitness",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["timestamp", "date-time", "audit-event", "schedule", "deadline", "report"],
    rationale:
      "Enterprise users need unambiguous time interpretation across tenants, regions, audit trails, and scheduled work.",
    requirement:
      "User-visible timestamps and deadlines must use an explicit timezone policy.",
    remediation:
      "Display user, tenant, company, or source timezone intentionally and include timezone labels where ambiguity affects decisions.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:audit-contract",
      "AFENDA:tenant-context-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.currency-code-explicitness",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["amount", "currency", "invoice", "payment", "report", "table-cell"],
    rationale:
      "Enterprise financial values are unsafe when currency is inferred from symbols or viewer locale alone.",
    requirement:
      "Currency values must include an explicit ISO currency code in the data contract and formatted display where ambiguity is possible.",
    remediation:
      "Format money with Intl.NumberFormat using an explicit currency code and show code labels for multi-currency surfaces.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:data-display-contract",
      "AFENDA:finance-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.unit-system-explicitness",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["unit", "quantity", "inventory", "logistics", "manufacturing", "report"],
    rationale:
      "Unit systems differ across regions and industries; ambiguous units can cause operational and financial errors.",
    requirement:
      "Quantities must include explicit unit codes in the data contract and user-visible labels where ambiguity is possible.",
    remediation:
      "Store canonical unit codes, format through approved unit primitives, and display unit labels for operational values.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:data-display-contract",
      "AFENDA:inventory-contract",
      "AFENDA:manufacturing-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.locale-aware-sorting",
    category: LOCALE,
    severity: WARNING,
    appliesTo: ["table", "data-grid", "search-results", "select", "combobox", "list"],
    rationale:
      "Alphabetical order, case handling, and accent handling differ by locale and affect enterprise lookup accuracy.",
    requirement:
      "User-visible sorting and comparison of localized text should use locale-aware collation.",
    remediation:
      "Use Intl.Collator or approved server-side collation with explicit locale and sensitivity settings.",
    references: ["AFENDA:locale-contract", "AFENDA:data-display-contract"],
    enforcement: HYBRID,
  },
  {
    id: "locale.rtl-directionality",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["app-shell", "page", "form", "navigation", "table", "popover"],
    forbidden: ["left/right directional CSS for logical layout", "icon direction not mirrored in RTL"],
    rationale:
      "Right-to-left locales require semantic direction and logical layout behavior, not only translated strings.",
    requirement:
      "Locale-aware surfaces must support document direction, logical spacing, mirrored navigation, and directional icon review.",
    remediation:
      "Use dir attributes, logical CSS properties, directional icon tokens, and RTL-aware layout tests for supported locales.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:layout-contract",
      "AFENDA:navigation-contract",
      "WCAG:1.3.2",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.legal-language-boundary",
    category: LOCALE,
    severity: ERROR,
    appliesTo: ["contract", "invoice", "policy", "consent", "terms", "regulatory-report"],
    rationale:
      "Legal and regulatory copy may require approved language versions, not automatic fallback or casual translation.",
    requirement:
      "Legal, financial, and regulatory surfaces must use approved locale versions and show the legally controlling language where required.",
    remediation:
      "Use approved legal message catalogs, version legal copy, and prevent unreviewed fallback for regulated flows.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:content-contract",
      "AFENDA:audit-contract",
      "AFENDA:compliance-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.export-locale-parity",
    category: LOCALE,
    severity: WARNING,
    appliesTo: ["export", "pdf", "csv", "invoice", "report", "print-view"],
    rationale:
      "Exports must remain understandable outside the runtime UI where user locale context may be lost.",
    requirement:
      "Exports must preserve locale, timezone, currency, unit, and language context explicitly.",
    remediation:
      "Include locale metadata, timezone labels, ISO currency codes, unit labels, and translated column headings where applicable.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:export-contract",
      "AFENDA:data-display-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.fallback-language-clarity",
    category: LOCALE,
    severity: WARNING,
    appliesTo: ["translation", "message-catalog", "empty-state", "error-message", "admin-shell"],
    rationale:
      "Missing translations should degrade predictably without silently mixing critical operational language.",
    requirement:
      "Locale fallback behavior must be explicit and safe for critical enterprise flows.",
    remediation:
      "Define fallback locale order, report missing keys, and avoid fallback-only copy for legal, financial, or destructive flows.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:content-contract",
      "AFENDA:observability-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "locale.translation-observability",
    category: LOCALE,
    severity: WARNING,
    appliesTo: ["message-catalog", "translation", "runtime-copy", "admin-shell"],
    rationale:
      "Missing, stale, or fallback translations need operational visibility before they affect critical workflows.",
    requirement:
      "Runtime locale fallback and missing translation keys should emit diagnostics in governed environments.",
    remediation:
      "Log missing keys, fallback hits, catalog version, locale, route, and feature owner through observability.",
    references: [
      "AFENDA:locale-contract",
      "AFENDA:message-catalog-contract",
      "AFENDA:observability-contract",
    ],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
