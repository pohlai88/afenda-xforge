"use client";

import type * as React from "react";

import { AccordionComposeGallery } from "../accordion/accordion-gallery";
import { AlertComposeGallery } from "../alert/alert-gallery";
import { AlertDialogComposeGallery } from "../alert-dialog/alert-dialog-gallery";
import { AspectRatioComposeGallery } from "../aspect-ratio/aspect-ratio-gallery";
import { AutocompleteComposeGallery } from "../autocomplete/autocomplete-gallery";
import { AvatarComposeGallery } from "../avatar/avatar-gallery";
import { BadgeComposeGallery } from "../badge/badge-gallery";
import { BreadcrumbComposeGallery } from "../breadcrumb/breadcrumb-gallery";
import { ButtonComposeGallery } from "../button/button-gallery";
import { ButtonGroupComposeGallery } from "../button-group/button-group-gallery";
import { CardComposeGallery } from "../card/card-gallery";
import { ChartComposeGallery } from "../chart/chart-gallery";
import { CheckboxComposeGallery } from "../checkbox/checkbox-gallery";
import { CollapsibleComposeGallery } from "../collapsible/collapsible-gallery";
import { ComboboxComposeGallery } from "../combobox/combobox-gallery";
import { CommandComposeGallery } from "../command/command-gallery";
import { DataGridComposeGallery } from "../data-grid/data-grid-gallery";
import { DateSelectorComposeGallery } from "../date-selector/date-selector-gallery";
import { DropdownMenuComposeGallery } from "../dropdown-menu/dropdown-menu-gallery";
import { EmptyComposeGallery } from "../empty/empty-gallery";
import { FieldComposeGallery } from "../field/field-gallery";
import { FileUploadComposeGallery } from "../file-upload/file-upload-gallery";
import { FiltersComposeGallery } from "../filters/filters-gallery";
import { FrameComposeGallery } from "../frame/frame-gallery";
import { InputGroupComposeGallery } from "../input-group/input-group-gallery";
import { KanbanComposeGallery } from "../kanban/kanban-gallery";
import { LineChartComposeGallery } from "../line-chart/line-chart-gallery";
import { NumberFieldComposeGallery } from "../number-field/number-field-gallery";
import { PhoneInputComposeGallery } from "../phone-input/phone-input-gallery";
import { RatingComposeGallery } from "../rating/rating-gallery";
import { ScrollspyComposeGallery } from "../scrollspy/scrollspy-gallery";
import { SheetComposeGallery } from "../sheet/sheet-gallery";
import { SkeletonComposeGallery } from "../skeleton/skeleton-gallery";
import { SortableComposeGallery } from "../sortable/sortable-gallery";
import { SpinnerComposeGallery } from "../spinner/spinner-gallery";
import { StatisticCardComposeGallery } from "../statistic-card/statistic-card-gallery";
import { StepperComposeGallery } from "../stepper/stepper-gallery";
import { TabsComposeGallery } from "../tabs/tabs-gallery";
import { TimelineComposeGallery } from "../timeline/timeline-gallery";
import { TreeComposeGallery } from "../tree/tree-gallery";

export type ComposePreviewGallery = {
  component: React.ComponentType;
  name: string;
  title: string;
};

export const composePreviewGalleryComponents = [
  { name: "accordion", title: "Accordion", component: AccordionComposeGallery },
  { name: "alert", title: "Alert", component: AlertComposeGallery },
  {
    name: "alert-dialog",
    title: "Alert Dialog",
    component: AlertDialogComposeGallery,
  },
  {
    name: "aspect-ratio",
    title: "Aspect Ratio",
    component: AspectRatioComposeGallery,
  },
  {
    name: "autocomplete",
    title: "Autocomplete",
    component: AutocompleteComposeGallery,
  },
  { name: "avatar", title: "Avatar", component: AvatarComposeGallery },
  { name: "badge", title: "Badge", component: BadgeComposeGallery },
  {
    name: "breadcrumb",
    title: "Breadcrumb",
    component: BreadcrumbComposeGallery,
  },
  { name: "button", title: "Button", component: ButtonComposeGallery },
  {
    name: "button-group",
    title: "Button Group",
    component: ButtonGroupComposeGallery,
  },
  { name: "card", title: "Card", component: CardComposeGallery },
  { name: "chart", title: "Chart", component: ChartComposeGallery },
  { name: "checkbox", title: "Checkbox", component: CheckboxComposeGallery },
  {
    name: "collapsible",
    title: "Collapsible",
    component: CollapsibleComposeGallery,
  },
  { name: "combobox", title: "Combobox", component: ComboboxComposeGallery },
  { name: "command", title: "Command", component: CommandComposeGallery },
  { name: "data-grid", title: "Data Grid", component: DataGridComposeGallery },
  {
    name: "date-selector",
    title: "Date Selector",
    component: DateSelectorComposeGallery,
  },
  {
    name: "dropdown-menu",
    title: "Dropdown Menu",
    component: DropdownMenuComposeGallery,
  },
  { name: "empty", title: "Empty", component: EmptyComposeGallery },
  { name: "field", title: "Field", component: FieldComposeGallery },
  {
    name: "file-upload",
    title: "File Upload",
    component: FileUploadComposeGallery,
  },
  { name: "filters", title: "Filters", component: FiltersComposeGallery },
  { name: "frame", title: "Frame", component: FrameComposeGallery },
  {
    name: "input-group",
    title: "Input Group",
    component: InputGroupComposeGallery,
  },
  { name: "kanban", title: "Kanban", component: KanbanComposeGallery },
  {
    name: "line-chart",
    title: "Line Chart",
    component: LineChartComposeGallery,
  },
  {
    name: "number-field",
    title: "Number Field",
    component: NumberFieldComposeGallery,
  },
  {
    name: "phone-input",
    title: "Phone Input",
    component: PhoneInputComposeGallery,
  },
  { name: "rating", title: "Rating", component: RatingComposeGallery },
  { name: "scrollspy", title: "Scrollspy", component: ScrollspyComposeGallery },
  { name: "sheet", title: "Sheet", component: SheetComposeGallery },
  { name: "skeleton", title: "Skeleton", component: SkeletonComposeGallery },
  { name: "sortable", title: "Sortable", component: SortableComposeGallery },
  { name: "spinner", title: "Spinner", component: SpinnerComposeGallery },
  {
    name: "statistic-card",
    title: "Statistic Card",
    component: StatisticCardComposeGallery,
  },
  { name: "stepper", title: "Stepper", component: StepperComposeGallery },
  { name: "tabs", title: "Tabs", component: TabsComposeGallery },
  { name: "timeline", title: "Timeline", component: TimelineComposeGallery },
  { name: "tree", title: "Tree", component: TreeComposeGallery },
] as const satisfies readonly ComposePreviewGallery[];

export type ComposePreviewGalleryName =
  (typeof composePreviewGalleryComponents)[number]["name"];

export {
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
};
