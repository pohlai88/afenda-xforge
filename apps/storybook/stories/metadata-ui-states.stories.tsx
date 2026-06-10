import {
  DegradedState,
  EmptyState,
  ErrorState,
  ForbiddenState,
  InvalidState,
  LoadingState,
  MaintenanceState,
  PartialState,
  ReadonlyState,
  ReadyState,
  STATE_VISUAL_MATRIX,
} from "@repo/metadata-ui/renderers";
import type { Meta, StoryObj } from "@storybook/react";

import {
  MetadataUiStoryFrame,
  metadataUiStoryParameters,
} from "./metadata-ui-story-utils";

const meta = {
  title: "Metadata UI/States",
  parameters: metadataUiStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function stateStory(
  state: keyof typeof STATE_VISUAL_MATRIX,
  Component: typeof LoadingState
): Story {
  const visual = STATE_VISUAL_MATRIX[state];
  return {
    render: () => (
      <MetadataUiStoryFrame>
        <Component
          description={visual.defaultDescription}
          title={visual.defaultTitle}
        />
      </MetadataUiStoryFrame>
    ),
  };
}

export const Loading: Story = stateStory("loading", LoadingState);
export const Empty: Story = stateStory("empty", EmptyState);
export const ErrorStateStory: Story = stateStory("error", ErrorState);
export const Forbidden: Story = stateStory("forbidden", ForbiddenState);
export const Ready: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <ReadyState>
        <div className="font-medium">Ready content surface</div>
      </ReadyState>
    </MetadataUiStoryFrame>
  ),
};
export const Invalid: Story = stateStory("invalid", InvalidState);
export const Degraded: Story = stateStory("degraded", DegradedState);
export const Partial: Story = stateStory("partial", PartialState);
export const Maintenance: Story = stateStory("maintenance", MaintenanceState);
export const Readonly: Story = stateStory("readonly", ReadonlyState);
