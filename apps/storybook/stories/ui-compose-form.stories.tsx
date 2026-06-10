import { AutocompleteComposeGallery } from "../../../packages/ui/src/components/compose/autocomplete/autocomplete-gallery";
import { ButtonComposeGallery } from "../../../packages/ui/src/components/compose/button/button-gallery";
import { ButtonGroupComposeGallery } from "../../../packages/ui/src/components/compose/button-group/button-group-gallery";
import { CheckboxComposeGallery } from "../../../packages/ui/src/components/compose/checkbox/checkbox-gallery";
import { ComboboxComposeGallery } from "../../../packages/ui/src/components/compose/combobox/combobox-gallery";
import { DateSelectorComposeGallery } from "../../../packages/ui/src/components/compose/date-selector/date-selector-gallery";
import { DropdownMenuComposeGallery } from "../../../packages/ui/src/components/compose/dropdown-menu/dropdown-menu-gallery";
import { FieldComposeGallery } from "../../../packages/ui/src/components/compose/field/field-gallery";
import { FileUploadComposeGallery } from "../../../packages/ui/src/components/compose/file-upload/file-upload-gallery";
import { InputGroupComposeGallery } from "../../../packages/ui/src/components/compose/input-group/input-group-gallery";
import { NumberFieldComposeGallery } from "../../../packages/ui/src/components/compose/number-field/number-field-gallery";
import { PhoneInputComposeGallery } from "../../../packages/ui/src/components/compose/phone-input/phone-input-gallery";
import { RatingComposeGallery } from "../../../packages/ui/src/components/compose/rating/rating-gallery";
import type { Meta, StoryObj } from "@storybook/react";

import { galleryStory } from "./ui-compose-story-utils";

const meta = {
  title: "UI/Compose/Form",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Autocomplete: Story = galleryStory(AutocompleteComposeGallery, "todo");
export const Button: Story = galleryStory(ButtonComposeGallery, "error");
export const ButtonGroup: Story = galleryStory(ButtonGroupComposeGallery, "todo");
export const Checkbox: Story = galleryStory(CheckboxComposeGallery, "error");
export const Combobox: Story = galleryStory(ComboboxComposeGallery, "todo");
export const DateSelector: Story = galleryStory(DateSelectorComposeGallery, "todo");
export const DropdownMenu: Story = galleryStory(DropdownMenuComposeGallery, "error");
export const Field: Story = galleryStory(FieldComposeGallery, "error");
export const FileUpload: Story = galleryStory(FileUploadComposeGallery, "todo");
export const InputGroup: Story = galleryStory(InputGroupComposeGallery, "todo");
export const NumberField: Story = galleryStory(NumberFieldComposeGallery, "todo");
export const PhoneInput: Story = galleryStory(PhoneInputComposeGallery, "todo");
export const Rating: Story = galleryStory(RatingComposeGallery, "todo");
