"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { cn } from "@repo/ui/lib/utils";
import { TriangleAlertIcon } from "lucide-react";
import type { ReactElement } from "react";
import {
  PREVIEW_PANEL_CLASS,
  PreviewHeader,
  PreviewPageShell,
  ValidationNote,
} from "./theme-studio-shared.tsx";

type FieldStatus = "default" | "error" | "success" | "warning";

type FormField =
  | {
      control: "input";
      helper: string;
      label: string;
      required?: boolean;
      status: FieldStatus;
      value: string;
    }
  | {
      control: "select";
      helper: string;
      label: string;
      options: readonly { label: string; value: string }[];
      required?: boolean;
      status: FieldStatus;
      value: string;
    };

const FORM_FIELDS: FormField[] = [
  {
    control: "input",
    label: "Tenant Display Name",
    value: "XForge Vietnam Operations",
    helper: "Visible in shell, invoices, approvals, and reports.",
    status: "success",
    required: true,
  },
  {
    control: "select",
    label: "Primary Business Unit",
    value: "feed",
    helper: "Used for initial operating context.",
    status: "default",
    required: true,
    options: [
      { value: "feed", label: "Feed Division" },
      { value: "retail", label: "Retail Division" },
      { value: "logistics", label: "Logistics Division" },
    ],
  },
  {
    control: "select",
    label: "Default Currency",
    value: "USD",
    helper: "Currency appears in financial tables and dashboards.",
    status: "warning",
    required: true,
    options: [
      { value: "USD", label: "USD — US Dollar" },
      { value: "VND", label: "VND — Vietnamese Dong" },
      { value: "EUR", label: "EUR — Euro" },
    ],
  },
  {
    control: "select",
    label: "Theme Preset",
    value: "afenda",
    helper: "Brand-aware preset with teal, indigo, and warm gold.",
    status: "success",
    options: [
      { value: "afenda", label: "Afenda (default)" },
      { value: "enterprise", label: "Enterprise neutral" },
      { value: "minimal", label: "Minimal contrast" },
    ],
  },
  {
    control: "input",
    label: "Approval Threshold",
    value: "50000",
    helper: "Must be reviewed because threshold exceeds default policy.",
    status: "warning",
  },
  {
    control: "input",
    label: "Tax Registration Number",
    value: "",
    helper: "This field is required before finance activation.",
    status: "error",
    required: true,
  },
];

const POLICY_CHECKS = [
  { label: "Brand color contrast", result: "Passed", tone: "success" },
  { label: "Warning color separation", result: "Passed", tone: "success" },
  {
    label: "Tenant identity completeness",
    result: "Needs input",
    tone: "warning",
  },
  { label: "Finance activation", result: "Blocked", tone: "destructive" },
] as const;

type SemanticTone = "destructive" | "info" | "success" | "warning";

const TONE_BADGE: Record<
  SemanticTone,
  "destructive-light" | "info-light" | "success-light" | "warning-light"
> = {
  success: "success-light",
  warning: "warning-light",
  destructive: "destructive-light",
  info: "info-light",
};

const TONE_SURFACE: Record<SemanticTone, string> = {
  success:
    "border-success-border bg-success-muted text-success-muted-foreground",
  warning:
    "border-warning-border bg-warning-muted text-warning-muted-foreground",
  destructive:
    "border-destructive-border bg-destructive-muted text-destructive-muted-foreground",
  info: "border-info-border bg-info-muted text-info-muted-foreground",
};

function getFieldClasses(status: FieldStatus): string {
  switch (status) {
    case "success":
      return "border-success-border focus-visible:border-success focus-visible:ring-success/30";
    case "warning":
      return "border-warning-border focus-visible:border-warning focus-visible:ring-warning/30";
    case "error":
      return "border-destructive-border focus-visible:border-destructive focus-visible:ring-destructive/30";
    case "default":
      return "border-input focus-visible:border-ring focus-visible:ring-ring/50";
    default:
      return "border-input focus-visible:border-ring focus-visible:ring-ring/50";
  }
}

function getHelperClasses(status: FieldStatus): string {
  switch (status) {
    case "success":
      return "text-success-muted-foreground";
    case "warning":
      return "text-warning-muted-foreground";
    case "error":
      return "text-destructive-muted-foreground";
    case "default":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
}

export function FormExperiencePreview(): ReactElement {
  return (
    <PreviewPageShell>
      <PreviewHeader
        description="Validates inputs, selects, validation states, neutral focus rings, required markers, form summary, and approval submit surfaces — where many ERP themes fail."
        previewNumber="03"
        scores={[
          { label: "Input clarity", value: 93 },
          { label: "Focus visibility", value: 91 },
          { label: "Validation clarity", value: 96 },
        ]}
        title="Form Experience Preview"
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="shadow-sm">
          <CardHeader className="border-border border-b">
            <CardTitle>Tenant configuration form</CardTitle>
            <CardDescription>
              Realistic admin form with default, success, warning, and error
              states on one screen.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2">
            {FORM_FIELDS.map((field) => (
              <FormFieldControl field={field} key={field.label} />
            ))}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="operating-notes">Operating Notes</Label>
              <Textarea
                className="min-h-32 px-4 py-3 leading-6"
                defaultValue="Tenant requires finance activation after registration number is verified. Theme customization is approved for brand preview only."
                id="operating-notes"
              />
              <p className="text-muted-foreground text-xs leading-5">
                Textarea validates long-form readability, focus ring, border
                contrast, and comfortable typing surfaces.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-border border-t sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-sm">Draft saved locally</p>
              <p className="mt-1 text-muted-foreground text-xs">
                Changes require validation before tenant activation.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="control-density"
                type="button"
                variant="outline"
              >
                Save draft
              </Button>
              <Button className="control-density" type="button">
                Submit for approval
              </Button>
            </div>
          </CardFooter>
        </Card>

        <aside className="grid gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Validation summary</CardTitle>
              <CardDescription>
                Status colors stay semantic — tenant brand must not change these
                meanings.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Alert variant="info">
                <AlertTitle>Semantic validation colors</AlertTitle>
                <AlertDescription>
                  Status tokens below must stay fixed under tenant brand
                  customization — brand primary must not replace warning or
                  destructive meaning.
                </AlertDescription>
              </Alert>

              {POLICY_CHECKS.map((check) => (
                <div
                  className={cn(
                    "flex items-center justify-between border border-border bg-surface p-4",
                    PREVIEW_PANEL_CLASS
                  )}
                  key={check.label}
                >
                  <div>
                    <p className="font-medium text-sm">{check.label}</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      System validation
                    </p>
                  </div>
                  <Badge size="sm" variant={TONE_BADGE[check.tone]}>
                    {check.result}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Focus ring test</CardTitle>
              <CardDescription>
                Default focus uses neutral ring. Brand ring is reserved for
                selected navigation or marketing chrome.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div
                className={cn(
                  "border border-border bg-surface p-4",
                  PREVIEW_PANEL_CLASS
                )}
              >
                <Label htmlFor="neutral-focus">Neutral focus input</Label>
                <Input
                  className="control-density mt-2"
                  defaultValue="Neutral ring from --ring"
                  id="neutral-focus"
                />
              </div>

              <div
                className={cn(
                  "border border-primary/30 bg-primary/10 p-4",
                  PREVIEW_PANEL_CLASS
                )}
              >
                <Label className="text-primary">Brand-selected surface</Label>
                <div
                  className={cn(
                    "mt-2 border border-primary/40 bg-card px-4 py-3 text-sm shadow-[0_0_24px_var(--brand-primary)]/10",
                    PREVIEW_PANEL_CLASS
                  )}
                >
                  Uses brand color as identity chrome, not default form focus.
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Form state palette</CardTitle>
            <CardDescription>
              Each state remains visually distinct under tenant customization.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <StatePreview
              className={TONE_SURFACE.success}
              description="Verified, valid, approved, or completed."
              title="Success"
            />
            <StatePreview
              className={TONE_SURFACE.warning}
              description="Needs attention but does not block progress."
              title="Warning"
            />
            <StatePreview
              className={TONE_SURFACE.destructive}
              description="Invalid, blocked, rejected, or dangerous action."
              title="Destructive"
            />
            <StatePreview
              className={TONE_SURFACE.info}
              description="Reference, evidence, note, or system message."
              title="Info"
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Approval submit panel</CardTitle>
            <CardDescription>
              Form footer must clearly show what happens when configuration
              changes are submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Alert className="items-start" variant="warning">
              <TriangleAlertIcon />
              <AlertTitle>Approval required before activation</AlertTitle>
              <AlertDescription>
                Finance activation is blocked until required registration fields
                are completed. Theme customization can be saved as a draft but
                cannot be published yet.
              </AlertDescription>
              <AlertAction>
                <Badge size="sm" variant="warning-light">
                  Pending Review
                </Badge>
              </AlertAction>
            </Alert>

            <div className="grid gap-3 md:grid-cols-3">
              <MiniStat label="Missing fields" tone="destructive" value="1" />
              <MiniStat label="Warnings" tone="warning" value="2" />
              <MiniStat label="Passed checks" tone="success" value="8" />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Form preview validation notes</CardTitle>
          <CardDescription>
            Page 3 confirms the theme is usable for enterprise input workflows,
            not only dashboard presentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ValidationNote
            description="Neutral focus ring remains visible in dense form workflows."
            title="Focus behavior"
          />
          <ValidationNote
            description="Destructive fields must be recognizable without relying only on red text."
            title="Error recognition"
          />
          <ValidationNote
            description="Warning must not be confused with warm brand accent."
            title="Warning separation"
          />
          <ValidationNote
            description="Textareas, labels, and helper copy remain readable in light and dark mode."
            title="Long-form comfort"
          />
        </CardContent>
      </Card>
    </PreviewPageShell>
  );
}

function FormFieldControl({ field }: { field: FormField }): ReactElement {
  const fieldId = field.label.toLowerCase().replace(/\s+/g, "-");
  const controlClass = cn(
    "control-density mt-2 w-full",
    getFieldClasses(field.status)
  );
  const isInvalid = field.status === "error";

  return (
    <div>
      <Label className="font-semibold" htmlFor={fieldId}>
        {field.label}
        {field.required ? (
          <span className="text-destructive-muted-foreground">*</span>
        ) : null}
      </Label>

      {field.control === "select" ? (
        <Select defaultValue={field.value}>
          <SelectTrigger
            aria-invalid={isInvalid || undefined}
            className={cn(controlClass, "w-full")}
            id={fieldId}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          aria-invalid={isInvalid || undefined}
          className={controlClass}
          defaultValue={field.value}
          id={fieldId}
          placeholder={field.value ? undefined : "Required information missing"}
        />
      )}

      <p
        className={cn("mt-2 text-xs leading-5", getHelperClasses(field.status))}
      >
        {field.helper}
      </p>
    </div>
  );
}

function StatePreview({
  className,
  description,
  title,
}: {
  className: string;
  description: string;
  title: string;
}): ReactElement {
  return (
    <div className={cn("border p-4", PREVIEW_PANEL_CLASS, className)}>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="mt-2 text-xs leading-5">{description}</p>
    </div>
  );
}

function MiniStat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "destructive" | "success" | "warning";
  value: string;
}): ReactElement {
  let surfaceClass = TONE_SURFACE.destructive;

  if (tone === "success") {
    surfaceClass = TONE_SURFACE.success;
  } else if (tone === "warning") {
    surfaceClass = TONE_SURFACE.warning;
  }

  return (
    <div className={cn("border p-4", PREVIEW_PANEL_CLASS, surfaceClass)}>
      <p className="font-semibold text-xs">{label}</p>
      <strong className="mt-2 block text-3xl text-tabular tracking-tight">
        {value}
      </strong>
    </div>
  );
}
