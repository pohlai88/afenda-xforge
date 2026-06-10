import { metadataUiGeneratedSectionFixtures } from "@repo/metadata-ui/fixtures";
import {
  MetadataCardSectionRenderer,
  MetadataFormSectionRenderer,
  MetadataSectionRenderer,
  MetadataTableSectionRenderer,
} from "@repo/metadata-ui/renderers";
import type { Meta, StoryObj } from "@storybook/react";

import {
  MetadataUiStoryFrame,
  metadataUiStoryContext,
  metadataUiStoryParameters,
} from "./metadata-ui-story-utils";

const sectionsByKey = Object.fromEntries(
  metadataUiGeneratedSectionFixtures.map((section) => [section.key, section])
);

const meta = {
  title: "Metadata UI/Sections",
  parameters: metadataUiStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FormSection: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <MetadataFormSectionRenderer
        context={metadataUiStoryContext}
        diagnostics={[]}
        section={sectionsByKey.form}
      />
    </MetadataUiStoryFrame>
  ),
};

export const TableSection: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <MetadataTableSectionRenderer
        context={metadataUiStoryContext}
        diagnostics={[]}
        section={sectionsByKey.table}
      />
    </MetadataUiStoryFrame>
  ),
};

export const ListSection: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <MetadataTableSectionRenderer
        context={metadataUiStoryContext}
        diagnostics={[]}
        section={sectionsByKey.list}
      />
    </MetadataUiStoryFrame>
  ),
};

export const CardSection: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <MetadataCardSectionRenderer
        context={metadataUiStoryContext}
        diagnostics={[]}
        section={sectionsByKey.card}
      />
    </MetadataUiStoryFrame>
  ),
};

export const GenericSection: Story = {
  render: () => (
    <MetadataUiStoryFrame>
      <MetadataSectionRenderer
        context={metadataUiStoryContext}
        diagnostics={[]}
        section={sectionsByKey.activity}
      >
        <div className="text-muted-foreground text-sm">
          Activity section body content.
        </div>
      </MetadataSectionRenderer>
    </MetadataUiStoryFrame>
  ),
};
