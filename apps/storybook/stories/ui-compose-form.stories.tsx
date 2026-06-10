import type { Meta, StoryObj } from "@storybook/react";

import { lazyGalleryStory } from "./ui-compose-story-utils";

const meta = {
  title: "UI/Compose/Form",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
    docs: {
      description: {
        component:
          "Data-entry and action compose galleries. Stories promoted to a11y.test error enforce axe in test:stories.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    showLink: {
      control: "boolean",
      description: "Compose autodocs argTypes example (see UI Primitives Actions)",
      table: { category: "Compose controls example" },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Autocomplete: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/autocomplete/autocomplete-gallery").then((module) => ({ default: module.AutocompleteComposeGallery })), "error");
export const Button: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/button/button-gallery").then((module) => ({ default: module.ButtonComposeGallery })), "error");
export const ButtonGroup: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/button-group/button-group-gallery").then((module) => ({ default: module.ButtonGroupComposeGallery })), "error");
export const Checkbox: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/checkbox/checkbox-gallery").then((module) => ({ default: module.CheckboxComposeGallery })), "error");
export const Combobox: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/combobox/combobox-gallery").then((module) => ({ default: module.ComboboxComposeGallery })), "error");
export const DateSelector: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/date-selector/date-selector-gallery").then((module) => ({ default: module.DateSelectorComposeGallery })), "error");
export const DropdownMenu: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/dropdown-menu/dropdown-menu-gallery").then((module) => ({ default: module.DropdownMenuComposeGallery })), "error");
export const Field: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/field/field-gallery").then((module) => ({ default: module.FieldComposeGallery })), "error");
export const FileUpload: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/file-upload/file-upload-gallery").then((module) => ({ default: module.FileUploadComposeGallery })), "error");
export const InputGroup: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/input-group/input-group-gallery").then((module) => ({ default: module.InputGroupComposeGallery })), "error");
export const NumberField: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/number-field/number-field-gallery").then((module) => ({ default: module.NumberFieldComposeGallery })), "error");
export const PhoneInput: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/phone-input/phone-input-gallery").then((module) => ({ default: module.PhoneInputComposeGallery })), "error");
export const Rating: Story = lazyGalleryStory(() => import("../../../packages/ui/src/components/compose/rating/rating-gallery").then((module) => ({ default: module.RatingComposeGallery })), "error");
