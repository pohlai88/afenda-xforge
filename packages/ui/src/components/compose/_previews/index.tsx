"use client";

import type * as React from "react";

import { AccordionComposeGallery } from "../accordion/accordion-gallery";
import { AlertComposeGallery } from "../alert/alert-gallery";
import { AlertDialogComposeGallery } from "../alert-dialog/alert-dialog-gallery";
import { AutocompleteComposeGallery } from "../autocomplete/autocomplete-gallery";
import { BadgeComposeGallery } from "../badge/badge-gallery";
import { DataGridComposeGallery } from "../data-grid/data-grid-gallery";
import { DateSelectorComposeGallery } from "../date-selector/date-selector-gallery";
import { FileUploadComposeGallery } from "../file-upload/file-upload-gallery";
import { FiltersComposeGallery } from "../filters/filters-gallery";
import { FrameComposeGallery } from "../frame/frame-gallery";
import { KanbanComposeGallery } from "../kanban/kanban-gallery";
import { LineChartComposeGallery } from "../line-chart/line-chart-gallery";
import { NumberFieldComposeGallery } from "../number-field/number-field-gallery";
import { PhoneInputComposeGallery } from "../phone-input/phone-input-gallery";
import { RatingComposeGallery } from "../rating/rating-gallery";
import { ScrollspyComposeGallery } from "../scrollspy/scrollspy-gallery";
import { SortableComposeGallery } from "../sortable/sortable-gallery";
import { StatisticCardComposeGallery } from "../statistic-card/statistic-card-gallery";

export type ComposePreviewGallery = {
  component: React.ComponentType;
  name: string;
  title: string;
};

export const composePreviewGalleryComponents = [
  {
    name: "accordion",
    title: "Accordion",
    component: AccordionComposeGallery,
  },
  {
    name: "alert",
    title: "Alert",
    component: AlertComposeGallery,
  },
  {
    name: "alert-dialog",
    title: "Alert Dialog",
    component: AlertDialogComposeGallery,
  },
  {
    name: "autocomplete",
    title: "Autocomplete",
    component: AutocompleteComposeGallery,
  },
  {
    name: "badge",
    title: "Badge",
    component: BadgeComposeGallery,
  },
  {
    name: "data-grid",
    title: "Data Grid",
    component: DataGridComposeGallery,
  },
  {
    name: "date-selector",
    title: "Date Selector",
    component: DateSelectorComposeGallery,
  },
  {
    name: "file-upload",
    title: "File Upload",
    component: FileUploadComposeGallery,
  },
  {
    name: "filters",
    title: "Filters",
    component: FiltersComposeGallery,
  },
  {
    name: "frame",
    title: "Frame",
    component: FrameComposeGallery,
  },
  {
    name: "kanban",
    title: "Kanban",
    component: KanbanComposeGallery,
  },
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
  {
    name: "rating",
    title: "Rating",
    component: RatingComposeGallery,
  },
  {
    name: "scrollspy",
    title: "Scrollspy",
    component: ScrollspyComposeGallery,
  },
  {
    name: "sortable",
    title: "Sortable",
    component: SortableComposeGallery,
  },
  {
    name: "statistic-card",
    title: "Statistic Card",
    component: StatisticCardComposeGallery,
  },
] as const satisfies readonly ComposePreviewGallery[];

export type ComposePreviewGalleryName =
  (typeof composePreviewGalleryComponents)[number]["name"];

export {
  AccordionComposeGallery,
  AlertComposeGallery,
  AlertDialogComposeGallery,
  AutocompleteComposeGallery,
  BadgeComposeGallery,
  DataGridComposeGallery,
  DateSelectorComposeGallery,
  FileUploadComposeGallery,
  FiltersComposeGallery,
  FrameComposeGallery,
  KanbanComposeGallery,
  LineChartComposeGallery,
  NumberFieldComposeGallery,
  PhoneInputComposeGallery,
  RatingComposeGallery,
  ScrollspyComposeGallery,
  SortableComposeGallery,
  StatisticCardComposeGallery,
};
