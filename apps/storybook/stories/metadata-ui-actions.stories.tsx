import { metadataUiGeneratedActionFixtures } from "@repo/metadata-ui/fixtures";
import {
  ButtonActionRenderer,
  DestructiveActionRenderer,
  MenuActionRenderer,
} from "@repo/metadata-ui/renderers";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";

import {
  MetadataUiStoryFrame,
  metadataUiStoryContext,
  metadataUiStoryParameters,
} from "./metadata-ui-story-utils";

const actionsByKey = Object.fromEntries(
  metadataUiGeneratedActionFixtures.map((action) => [action.key, action])
);

const meta = {
  title: "Metadata UI/Actions",
  parameters: metadataUiStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ButtonAction: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <ButtonActionRenderer
        action={actionsByKey.save}
        context={metadataUiStoryContext}
        diagnostics={[]}
      />
    </MetadataUiStoryFrame>
  ),
};

export const DestructiveAction: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <DestructiveActionRenderer
        action={actionsByKey.delete}
        context={metadataUiStoryContext}
        diagnostics={[]}
      />
    </MetadataUiStoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const deleteButton = canvas.getByRole("button", { name: "Delete" });

    await userEvent.click(deleteButton);
    await expect(
      body.getByRole("alertdialog", { name: /confirm delete/i })
    ).toBeVisible();
    await expect(body.getByText("Delete this invoice?")).toBeVisible();

    await userEvent.click(body.getByRole("button", { name: "Cancel" }));
    await expect(
      body.queryByRole("alertdialog", { name: /confirm delete/i })
    ).not.toBeInTheDocument();
  },
};

export const MenuAction: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <MenuActionRenderer
        action={actionsByKey.more}
        context={metadataUiStoryContext}
        diagnostics={[]}
      />
    </MetadataUiStoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const moreButton = canvas.getByRole("button", { name: "More" });

    await expect(moreButton).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(moreButton);
    await expect(moreButton).toHaveFocus();
  },
};
