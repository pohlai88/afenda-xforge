"use client";

import { useEffect, useState } from "react";
import { lamLeaveApprovalStepKindLabels } from "@repo/features-time-attendance-leave-attendance-management/contract";

type ApprovalRouteStepDraft = {
  approverRef: string;
  fallbackToHr: boolean;
  kind: keyof typeof lamLeaveApprovalStepKindLabels;
  label: string;
  order: number;
};

type LamApprovalRouteStepsEditorProps = {
  initialSteps?: readonly {
    approverRef?: string | null;
    fallbackToHr?: boolean;
    kind: keyof typeof lamLeaveApprovalStepKindLabels;
    label?: string | null;
    order: number;
  }[];
};

const fieldClassName =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const labelClassName = "block font-medium text-sm";

const createDefaultSteps = (): ApprovalRouteStepDraft[] => [
  {
    approverRef: "",
    fallbackToHr: true,
    kind: "direct_manager",
    label: "",
    order: 1,
  },
];

const normalizeInitialSteps = (
  initialSteps: LamApprovalRouteStepsEditorProps["initialSteps"]
): ApprovalRouteStepDraft[] => {
  if (!initialSteps || initialSteps.length === 0) {
    return createDefaultSteps();
  }

  return [...initialSteps]
    .sort((left, right) => left.order - right.order)
    .map((step, index) => ({
      approverRef: step.approverRef ?? "",
      fallbackToHr: step.fallbackToHr ?? false,
      kind: step.kind,
      label: step.label ?? "",
      order: index + 1,
    }));
};

export const LamApprovalRouteStepsEditor = ({
  initialSteps,
}: LamApprovalRouteStepsEditorProps) => {
  const [steps, setSteps] = useState<ApprovalRouteStepDraft[]>(() =>
    normalizeInitialSteps(initialSteps)
  );

  useEffect(() => {
    setSteps(normalizeInitialSteps(initialSteps));
  }, [initialSteps]);

  const updateStep = (
    index: number,
    patch: Partial<ApprovalRouteStepDraft>
  ): void => {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch } : step
      )
    );
  };

  const addStep = (): void => {
    setSteps((current) => [
      ...current,
      {
        approverRef: "",
        fallbackToHr: true,
        kind: "direct_manager",
        label: "",
        order: current.length + 1,
      },
    ]);
  };

  const removeStep = (index: number): void => {
    setSteps((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current
        .filter((_, stepIndex) => stepIndex !== index)
        .map((step, stepIndex) => ({
          ...step,
          order: stepIndex + 1,
        }));
    });
  };

  const serializedSteps = JSON.stringify(
    steps.map((step) => ({
      ...(step.approverRef.trim().length > 0
        ? { approverRef: step.approverRef.trim() }
        : {}),
      ...(step.label.trim().length > 0 ? { label: step.label.trim() } : {}),
      fallbackToHr: step.fallbackToHr,
      kind: step.kind,
      order: step.order,
    }))
  );

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-medium text-sm">Approval steps</h4>
        <button
          className="rounded-md border border-border px-2 py-1 text-xs transition hover:bg-muted"
          onClick={addStep}
          type="button"
        >
          Add step
        </button>
      </div>
      {steps.map((step, index) => (
        <div
          className="grid gap-3 rounded-md border border-border/70 p-4 md:grid-cols-2"
          key={`approval-step-${step.order}`}
        >
          <label className={labelClassName}>
            Step {step.order} kind
            <select
              className={fieldClassName}
              onChange={(event) =>
                updateStep(index, {
                  kind: event.target
                    .value as ApprovalRouteStepDraft["kind"],
                })
              }
              value={step.kind}
            >
              {Object.entries(lamLeaveApprovalStepKindLabels).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </label>
          <label className={labelClassName}>
            Label (optional)
            <input
              className={fieldClassName}
              onChange={(event) =>
                updateStep(index, { label: event.target.value })
              }
              value={step.label}
            />
          </label>
          <label className={labelClassName}>
            Approver ref (optional)
            <input
              className={fieldClassName}
              onChange={(event) =>
                updateStep(index, { approverRef: event.target.value })
              }
              placeholder="Required for named approver"
              value={step.approverRef}
            />
          </label>
          <label className="flex items-center gap-2 self-end font-medium text-sm">
            <input
              checked={step.fallbackToHr}
              onChange={(event) =>
                updateStep(index, { fallbackToHr: event.target.checked })
              }
              type="checkbox"
            />
            Fallback to HR
          </label>
          {steps.length > 1 ? (
            <div className="md:col-span-2">
              <button
                className="rounded-md border border-border px-2 py-1 text-xs transition hover:bg-muted"
                onClick={() => removeStep(index)}
                type="button"
              >
                Remove step
              </button>
            </div>
          ) : null}
        </div>
      ))}
      <input name="stepsJson" type="hidden" value={serializedSteps} />
    </div>
  );
};
