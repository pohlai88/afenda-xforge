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
import { Separator } from "@repo/ui/components/separator";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@repo/ui/components/ui/alert";
import { cn } from "@repo/ui/lib/utils";
import { SparklesIcon, TriangleAlertIcon } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";
import { LANE_PILL_CLASS } from "./theme-studio-lane-tokens.ts";
import type { SemanticTone } from "./theme-studio-shared.tsx";
import {
  IntelligencePreviewHeader,
  PREVIEW_PANEL_CLASS,
  PreviewPageShell,
  SEMANTIC_TONE_BADGE,
  SEMANTIC_TONE_SOLID,
  SEMANTIC_TONE_SURFACE,
  ValidationNote,
} from "./theme-studio-shared.tsx";

type EvidenceItem = {
  confidence: string;
  source: string;
  summary: string;
  title: string;
  tone: SemanticTone;
};

type ActionItem = {
  impact: string;
  owner: string;
  title: string;
  tone: SemanticTone;
};

type TimelineItem = {
  description: string;
  label: string;
  tone: SemanticTone;
};

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    title: "Revenue variance detected",
    source: "Finance / General Ledger",
    summary:
      "Monthly revenue is 8.4% below forecast due to delayed customer orders.",
    confidence: "92%",
    tone: "warning",
  },
  {
    title: "Inventory pressure rising",
    source: "Inventory / Stock Control",
    summary:
      "Three raw material groups are projected to fall below safety stock within 9 days.",
    confidence: "88%",
    tone: "destructive",
  },
  {
    title: "Approval aging improved",
    source: "Governance / Approval Queue",
    summary:
      "Average approval cycle reduced from 4.2 days to 2.7 days this month.",
    confidence: "95%",
    tone: "success",
  },
  {
    title: "Customer order pattern changed",
    source: "Sales / Customer Orders",
    summary:
      "Two key customers shifted order timing from weekly to monthly consolidation.",
    confidence: "81%",
    tone: "info",
  },
];

const RECOMMENDED_ACTIONS: ActionItem[] = [
  {
    title: "Escalate raw material purchase",
    owner: "Procurement",
    impact: "Prevent stockout risk",
    tone: "destructive",
  },
  {
    title: "Review delayed customer orders",
    owner: "Sales",
    impact: "Recover revenue timing",
    tone: "warning",
  },
  {
    title: "Approve vendor onboarding",
    owner: "Governance",
    impact: "Increase supply options",
    tone: "info",
  },
];

const REASONING_TIMELINE: TimelineItem[] = [
  {
    label: "Question",
    description: "What requires executive attention today?",
    tone: "info",
  },
  {
    label: "Evidence",
    description: "Lynx found signals across finance, inventory, and approvals.",
    tone: "warning",
  },
  {
    label: "Decision",
    description:
      "Recommended priority is inventory risk before revenue review.",
    tone: "destructive",
  },
  {
    label: "Action",
    description:
      "Create procurement escalation and assign governance approval.",
    tone: "success",
  },
];

const PROMPT_CHIPS = [
  "Explain variance",
  "Show evidence",
  "Create action plan",
] as const;

export function NexusLynxPreview(): ReactElement {
  const [query, setQuery] = useState(
    "What requires executive attention today?"
  );

  return (
    <PreviewPageShell>
      <IntelligencePreviewHeader
        description="Validates how the intelligence lane feels across evidence discovery, reasoning summaries, recommended actions, approval handoff, and audit-ready decision trails — Evidence → Reasoning → Decision → Approval → Audit."
        previewNumber="05"
        scores={[
          { label: "Intelligence identity", value: 96 },
          { label: "Evidence readability", value: 93 },
          { label: "Action clarity", value: 91 },
        ]}
        title="Nexus / Lynx Intelligence Preview"
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card
          className={cn(
            "border-lane-intelligence-border bg-lane-intelligence-muted text-lane-intelligence-muted-foreground shadow-sm",
            PREVIEW_PANEL_CLASS
          )}
        >
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="text-2xl">Ask Lynx</CardTitle>
                <CardDescription className="opacity-85">
                  Tenants must immediately feel Lynx is the evidence engine, not
                  just another report screen.
                </CardDescription>
              </div>
              <Badge
                className={cn("shrink-0", LANE_PILL_CLASS.intelligence)}
                variant="outline"
              >
                Intelligence lane
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border border-lane-intelligence-border bg-card p-4 shadow-sm",
                PREVIEW_PANEL_CLASS
              )}
            >
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  aria-label="Ask Lynx"
                  className="control-density min-w-0 flex-1"
                  onChange={(event) => setQuery(event.target.value)}
                  value={query}
                />
                <Button
                  className="control-density shrink-0 gap-2"
                  type="button"
                >
                  <SparklesIcon className="size-4" />
                  Ask Lynx
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {PROMPT_CHIPS.map((label) => (
                  <Button
                    className={cn(
                      "h-auto border-lane-intelligence-border bg-lane-intelligence-muted px-3 py-2 text-lane-intelligence-muted-foreground text-xs hover:bg-surface",
                      PREVIEW_PANEL_CLASS
                    )}
                    key={label}
                    onClick={() => setQuery(label)}
                    type="button"
                    variant="outline"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Lynx decision score</CardTitle>
            <CardDescription>
              Intelligence experience should be premium but still operationally
              clear.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "grid place-items-center border border-lane-intelligence-border bg-lane-intelligence-muted p-8 text-lane-intelligence-muted-foreground",
                PREVIEW_PANEL_CLASS
              )}
            >
              <div
                className={cn(
                  "grid size-36 place-items-center border border-lane-intelligence-border bg-card shadow-[0_0_40px_var(--lane-intelligence-glow)]",
                  "rounded-full"
                )}
              >
                <div className="text-center">
                  <strong className="block text-4xl text-tabular tracking-tight">
                    91
                  </strong>
                  <span className="mt-1 block font-semibold text-xs">
                    Confidence
                  </span>
                </div>
              </div>

              <p className="mt-5 max-w-sm text-center text-sm leading-6 opacity-85">
                Recommended action is based on four verified evidence groups
                across finance, inventory, sales, and governance.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Evidence cards</CardTitle>
                <CardDescription>
                  Status colors explain meaning. Intelligence lane explains
                  where the evidence experience belongs.
                </CardDescription>
              </div>
              <Badge size="sm" variant="info-light">
                4 evidence groups
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {EVIDENCE_ITEMS.map((item) => (
              <EvidenceCard item={item} key={item.title} />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Reasoning chain</CardTitle>
            <CardDescription>
              How Lynx moved from question to evidence to decision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-4">
              {REASONING_TIMELINE.map((item, index) => (
                <li className="flex gap-4" key={item.label}>
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-full font-bold text-background text-xs",
                        SEMANTIC_TONE_SOLID[item.tone]
                      )}
                    >
                      {index + 1}
                    </span>
                    {index < REASONING_TIMELINE.length - 1 ? (
                      <Separator
                        className="mt-2 h-full min-h-8 w-px"
                        orientation="vertical"
                      />
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "min-w-0 flex-1 border border-border bg-surface p-4",
                      PREVIEW_PANEL_CLASS
                    )}
                  >
                    <h3 className="font-semibold text-sm">{item.label}</h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-6">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recommended actions</CardTitle>
            <CardDescription>
              Lynx creates action clarity, not just generated text.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {RECOMMENDED_ACTIONS.map((item) => (
              <ActionCard item={item} key={item.title} />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Decision handoff</CardTitle>
                <CardDescription>
                  Transition from intelligence to governance workflow.
                </CardDescription>
              </div>
              <Badge
                className={cn("shrink-0", LANE_PILL_CLASS.governance)}
                variant="outline"
              >
                Governance handoff
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Alert className="items-start" variant="warning">
              <TriangleAlertIcon />
              <AlertTitle>Approval required: procurement escalation</AlertTitle>
              <AlertDescription>
                Lynx recommends escalating raw material purchase approval
                because projected stockout risk is higher than delayed revenue
                impact.
              </AlertDescription>
              <AlertAction>
                <Badge size="sm" variant="warning-light">
                  Pending
                </Badge>
              </AlertAction>
            </Alert>

            <div className="grid gap-3 md:grid-cols-3">
              <DecisionMiniStat label="Evidence" tone="info" value="4" />
              <DecisionMiniStat label="Risk items" tone="warning" value="2" />
              <DecisionMiniStat label="Critical" tone="destructive" value="1" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button className="control-density" type="button" variant="outline">
              Save decision draft
            </Button>
            <Button className="control-density" type="button">
              Send to approval
            </Button>
          </CardFooter>
        </Card>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Nexus / Lynx preview validation notes</CardTitle>
          <CardDescription>
            Page 5 confirms whether the tenant theme supports evidence-driven
            decision operation — the most differentiated part of Afenda/XForge.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ValidationNote
            description="Lynx must feel visually connected to the intelligence lane without becoming noisy."
            title="Intelligence identity"
          />
          <ValidationNote
            description="Evidence cards must not confuse lane color with status color."
            title="Evidence separation"
          />
          <ValidationNote
            description="Users should understand what Lynx recommends and why."
            title="Decision clarity"
          />
          <ValidationNote
            description="Recommended actions must transition naturally into approval and audit workflows."
            title="Governance handoff"
          />
        </CardContent>
      </Card>
    </PreviewPageShell>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }): ReactElement {
  return (
    <article
      className={cn("border border-border bg-surface p-5", PREVIEW_PANEL_CLASS)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge size="sm" variant={SEMANTIC_TONE_BADGE[item.tone]}>
            {item.confidence} confidence
          </Badge>
          <h3 className="mt-4 font-semibold text-sm">{item.title}</h3>
          <p className="mt-1 text-muted-foreground text-xs">{item.source}</p>
        </div>
        <span
          className={cn(
            "size-3 shrink-0 rounded-full",
            SEMANTIC_TONE_SOLID[item.tone]
          )}
        />
      </div>
      <p className="mt-4 text-muted-foreground text-sm leading-6">
        {item.summary}
      </p>
    </article>
  );
}

function ActionCard({ item }: { item: ActionItem }): ReactElement {
  return (
    <article
      className={cn("border border-border bg-surface p-4", PREVIEW_PANEL_CLASS)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm">{item.title}</h3>
          <p className="mt-1 text-muted-foreground text-xs">
            Owner: {item.owner}
          </p>
        </div>
        <Badge size="sm" variant={SEMANTIC_TONE_BADGE[item.tone]}>
          {item.impact}
        </Badge>
      </div>
    </article>
  );
}

function DecisionMiniStat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: SemanticTone;
  value: string;
}): ReactElement {
  return (
    <div
      className={cn(
        "border p-4",
        PREVIEW_PANEL_CLASS,
        SEMANTIC_TONE_SURFACE[tone]
      )}
    >
      <p className="font-semibold text-xs">{label}</p>
      <strong className="mt-2 block text-3xl text-tabular tracking-tight">
        {value}
      </strong>
    </div>
  );
}
