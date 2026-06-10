import {
  AccordionComposeGallery,
  AlertComposeGallery,
  AlertDialogComposeGallery,
  AspectRatioComposeGallery,
  AutocompleteComposeGallery,
  AvatarComposeGallery,
  BadgeComposeGallery,
  BreadcrumbComposeGallery,
  ButtonComposeGallery,
  ButtonGroupComposeGallery,
  CardComposeGallery,
  ChartComposeGallery,
  CheckboxComposeGallery,
  CollapsibleComposeGallery,
  ComboboxComposeGallery,
  CommandComposeGallery,
  DataGridComposeGallery,
  DateSelectorComposeGallery,
  DropdownMenuComposeGallery,
  EmptyComposeGallery,
  FieldComposeGallery,
  FileUploadComposeGallery,
  FiltersComposeGallery,
  FrameComposeGallery,
  InputGroupComposeGallery,
  KanbanComposeGallery,
  LineChartComposeGallery,
  NumberFieldComposeGallery,
  PhoneInputComposeGallery,
  RatingComposeGallery,
  ScrollspyComposeGallery,
  SheetComposeGallery,
  SkeletonComposeGallery,
  SortableComposeGallery,
  SpinnerComposeGallery,
  StatisticCardComposeGallery,
  StepperComposeGallery,
  TabsComposeGallery,
  TimelineComposeGallery,
  TreeComposeGallery,
} from "@repo/ui/components/compose/previews";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType, ReactNode } from "react";

function GalleryFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl p-6 md:p-10">{children}</div>;
}

function galleryStory(Gallery: ComponentType) {
  return {
    render: () => (
      <GalleryFrame>
        <Gallery />
      </GalleryFrame>
    ),
  };
}

const meta = {
  title: "UI/Compose",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Accordion: Story = galleryStory(AccordionComposeGallery);
export const Alert: Story = galleryStory(AlertComposeGallery);
export const AlertDialog: Story = galleryStory(AlertDialogComposeGallery);
export const AspectRatio: Story = galleryStory(AspectRatioComposeGallery);
export const Autocomplete: Story = galleryStory(AutocompleteComposeGallery);
export const Avatar: Story = galleryStory(AvatarComposeGallery);
export const Badge: Story = galleryStory(BadgeComposeGallery);
export const Breadcrumb: Story = galleryStory(BreadcrumbComposeGallery);
export const Button: Story = galleryStory(ButtonComposeGallery);
export const ButtonGroup: Story = galleryStory(ButtonGroupComposeGallery);
export const Card: Story = galleryStory(CardComposeGallery);
export const Chart: Story = galleryStory(ChartComposeGallery);
export const Checkbox: Story = galleryStory(CheckboxComposeGallery);
export const Collapsible: Story = galleryStory(CollapsibleComposeGallery);
export const Combobox: Story = galleryStory(ComboboxComposeGallery);
export const Command: Story = galleryStory(CommandComposeGallery);
export const DataGrid: Story = galleryStory(DataGridComposeGallery);
export const DateSelector: Story = galleryStory(DateSelectorComposeGallery);
export const DropdownMenu: Story = galleryStory(DropdownMenuComposeGallery);
export const Empty: Story = galleryStory(EmptyComposeGallery);
export const Field: Story = galleryStory(FieldComposeGallery);
export const FileUpload: Story = galleryStory(FileUploadComposeGallery);
export const Filters: Story = galleryStory(FiltersComposeGallery);
export const Frame: Story = galleryStory(FrameComposeGallery);
export const InputGroup: Story = galleryStory(InputGroupComposeGallery);
export const Kanban: Story = galleryStory(KanbanComposeGallery);
export const LineChart: Story = galleryStory(LineChartComposeGallery);
export const NumberField: Story = galleryStory(NumberFieldComposeGallery);
export const PhoneInput: Story = galleryStory(PhoneInputComposeGallery);
export const Rating: Story = galleryStory(RatingComposeGallery);
export const Scrollspy: Story = galleryStory(ScrollspyComposeGallery);
export const Sheet: Story = galleryStory(SheetComposeGallery);
export const Skeleton: Story = galleryStory(SkeletonComposeGallery);
export const Sortable: Story = galleryStory(SortableComposeGallery);
export const Spinner: Story = galleryStory(SpinnerComposeGallery);
export const StatisticCard: Story = galleryStory(StatisticCardComposeGallery);
export const Stepper: Story = galleryStory(StepperComposeGallery);
export const Tabs: Story = galleryStory(TabsComposeGallery);
export const Timeline: Story = galleryStory(TimelineComposeGallery);
export const Tree: Story = galleryStory(TreeComposeGallery);
