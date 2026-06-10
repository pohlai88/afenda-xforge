import { Alert, AlertDescription, AlertTitle, Skeleton } from "@repo/ui";
import { Progress } from "@repo/ui/components/ui/progress";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI/Primitives/Feedback",
  parameters: {
    layout: "centered",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Alerts: Story = {
  render: () => (
    <div className="grid w-full max-w-lg gap-4">
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>
          Metadata surfaces can surface inline guidance here.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const ProgressAndSkeleton: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-4">
      <Progress aria-label="Upload progress" value={62} />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  ),
};
