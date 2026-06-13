import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const IMAGES = "images" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_IMAGES_RULES = [
  {
    id: "images.dimensions",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["img", "Image", "media", "thumbnail", "avatar"],
    rationale:
      "Explicit image dimensions prevent cumulative layout shift and preserve stable enterprise layouts.",
    requirement:
      "Images must reserve stable dimensions before loading.",
    remediation:
      "Provide width and height, aspect-ratio, or a stable reserved container for every non-background image.",
    references: ["AFENDA:image-contract", "CoreWebVitals:CLS"],
    enforcement: STATIC,
  },
  {
    id: "images.alt-contract",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["img", "Image", "avatar", "thumbnail", "chart-image", "icon-image"],
    rationale:
      "Images need text alternatives unless they are purely decorative.",
    requirement:
      "Meaningful images must expose useful alternative text and decorative images must use empty alt text.",
    remediation:
      "Add meaningful alt text for informative images or alt=\"\" for decorative images.",
    references: ["AFENDA:image-contract", "WCAG:1.1.1"],
    enforcement: STATIC,
  },
  {
    id: "images.decorative-hidden-from-assistive-tech",
    category: IMAGES,
    severity: WARNING,
    appliesTo: ["decorative-image", "background-image", "illustration", "icon-image"],
    rationale:
      "Decorative images should not add noise to screen reader navigation.",
    requirement:
      "Decorative images must be hidden from assistive technology or use empty alt text.",
    remediation:
      "Use alt=\"\", aria-hidden=\"true\", or CSS background imagery for decorative-only assets.",
    references: [
      "AFENDA:image-contract",
      "AFENDA:accessibility-contract",
      "WCAG:1.1.1",
    ],
    enforcement: STATIC,
  },
  {
    id: "images.no-text-only-raster",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["banner", "hero", "empty-state", "marketing-surface", "report-image"],
    forbidden: ["meaningful text only in image", "localized copy baked into raster image"],
    rationale:
      "Text baked into images cannot reliably localize, scale, reflow, or expose accessible text.",
    requirement:
      "Meaningful product text must not exist only inside raster image assets.",
    remediation:
      "Render text as HTML/CSS and keep images decorative or supplemental.",
    references: ["AFENDA:image-contract", "AFENDA:typography-contract", "WCAG:1.4.5"],
    enforcement: HYBRID,
  },
  {
    id: "images.responsive-source-selection",
    category: IMAGES,
    severity: WARNING,
    appliesTo: ["img", "Image", "picture", "srcset", "hero-media"],
    rationale:
      "Oversized image downloads degrade route performance and mobile usability.",
    requirement:
      "Responsive images must provide appropriate source sizes for the rendered viewport and density.",
    remediation:
      "Use responsive image primitives, sizes/srcset, and avoid serving desktop-size assets to constrained layouts.",
    references: ["AFENDA:image-contract", "AFENDA:performance-contract", "CoreWebVitals:LCP"],
    enforcement: HYBRID,
  },
  {
    id: "images.loading-priority",
    category: IMAGES,
    severity: WARNING,
    appliesTo: ["hero-image", "thumbnail", "avatar", "below-fold-image", "gallery"],
    rationale:
      "Incorrect image priority can delay critical content or waste bandwidth on noncritical media.",
    requirement:
      "Image loading priority must match visual criticality and viewport position.",
    remediation:
      "Prioritize the primary above-the-fold image and lazy-load noncritical or below-the-fold images.",
    references: ["AFENDA:image-contract", "CoreWebVitals:LCP"],
    enforcement: HYBRID,
  },
  {
    id: "images.format-optimization",
    category: IMAGES,
    severity: WARNING,
    appliesTo: ["image-asset", "hero-media", "thumbnail", "illustration", "avatar"],
    rationale:
      "Unoptimized formats increase bandwidth and slow enterprise workflows.",
    requirement:
      "Image assets should use efficient formats and compression appropriate to their purpose.",
    remediation:
      "Use optimized formats such as WebP or AVIF where supported, compress assets, and avoid shipping oversized originals.",
    references: ["AFENDA:image-contract", "AFENDA:performance-contract"],
    enforcement: HYBRID,
  },
  {
    id: "images.secure-remote-sources",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["remote-image", "user-image", "integration-image", "avatar", "markdown-image"],
    forbidden: ["unvalidated remote image URL", "javascript image URL", "data URL from untrusted source"],
    rationale:
      "Remote images can leak data, track users, or introduce unsafe content when sources are not governed.",
    requirement:
      "Remote image sources must be validated and constrained to approved protocols and domains.",
    remediation:
      "Use an allowlist for remote image domains, reject unsafe protocols, and proxy or sanitize untrusted integration images.",
    references: ["AFENDA:image-contract", "AFENDA:security-ui-contract"],
    enforcement: HYBRID,
  },
  {
    id: "images.user-upload-safety",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["user-image", "avatar", "attachment-preview", "markdown-image", "integration-image"],
    rationale:
      "User-uploaded images can contain unsafe payloads, tracking vectors, or inappropriate content.",
    requirement:
      "User-uploaded images must be validated, size-limited, type-checked, and served through approved storage or proxy paths.",
    remediation:
      "Validate MIME type, dimensions, byte size, file signature, storage path, and strip unsafe metadata where required.",
    references: [
      "AFENDA:image-contract",
      "AFENDA:security-ui-contract",
      "AFENDA:upload-contract",
      "AFENDA:privacy-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "images.sensitive-image-redaction",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["document-preview", "attachment-preview", "audit-evidence", "support-session", "report-image"],
    rationale:
      "Images may expose sensitive enterprise data through previews, screenshots, or evidence panels.",
    requirement:
      "Sensitive image previews must respect permissions, scope, masking, and audit visibility rules.",
    remediation:
      "Gate image previews by permission, avoid unauthorized thumbnails, and redact sensitive content where required.",
    references: [
      "AFENDA:image-contract",
      "AFENDA:permission-contract",
      "AFENDA:audit-contract",
      "AFENDA:security-ui-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "images.tenant-brand-boundary",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["tenant-logo", "company-logo", "app-shell", "admin-shell", "report", "export"],
    rationale:
      "Tenant branding must not override product identity, security context, or legal ownership.",
    requirement:
      "Tenant/company logos must render only inside approved brand slots with safe fallback and scope awareness.",
    remediation:
      "Use governed logo slots, validate image source, preserve active scope labels, and prevent tenant branding from replacing system authority indicators.",
    references: [
      "AFENDA:image-contract",
      "AFENDA:tenant-context-contract",
      "AFENDA:security-ui-contract",
      "AFENDA:theming-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "images.avatar-fallback",
    category: IMAGES,
    severity: WARNING,
    appliesTo: ["avatar", "user-image", "company-logo", "tenant-logo"],
    rationale:
      "Missing identity images must not create broken UI or ambiguous records.",
    requirement:
      "Avatars and logos must define stable fallback rendering when images fail or are absent.",
    remediation:
      "Use initials, governed placeholder icons, fallback backgrounds, and accessible labels for identity images.",
    references: ["AFENDA:image-contract", "AFENDA:data-display-contract"],
    enforcement: HYBRID,
  },
  {
    id: "images.critical-image-fallback",
    category: IMAGES,
    severity: WARNING,
    appliesTo: ["chart-image", "document-preview", "attachment-preview", "map-image", "qr-image"],
    rationale:
      "Critical image failures must not block users from understanding or completing workflows.",
    requirement:
      "Critical informational images must provide fallback text, retry, or alternative data access.",
    remediation:
      "Provide fallback summaries, downloadable source files, retry actions, or structured data alternatives.",
    references: [
      "AFENDA:image-contract",
      "AFENDA:feedback-contract",
      "AFENDA:data-display-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "images.animated-image-control",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["gif", "animated-image", "hero-media", "empty-state", "marketing-surface"],
    rationale:
      "Uncontrolled animated images can distract users, harm accessibility, and waste resources.",
    requirement:
      "Animated images must respect reduced-motion preferences and avoid essential information existing only in motion.",
    remediation:
      "Provide static alternatives, pause controls, or avoid animation for operational UI.",
    references: [
      "AFENDA:image-contract",
      "AFENDA:motion-contract",
      "AFENDA:accessibility-contract",
      "WCAG:2.2.2",
    ],
    enforcement: HYBRID,
  },
  {
    id: "images.asset-ownership",
    category: IMAGES,
    severity: ERROR,
    appliesTo: ["image-asset", "logo", "illustration", "hero-media", "empty-state"],
    rationale:
      "Enterprise image assets need clear ownership, source, and replacement governance.",
    requirement:
      "Product image assets must have an owning package, purpose, and approved usage context.",
    remediation:
      "Register shared image assets through governed asset metadata instead of importing unmanaged files directly.",
    references: [
      "AFENDA:image-contract",
      "AFENDA:asset-governance-contract",
      "AFENDA:design-system-contract",
    ],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
