import type * as React from "react";

import {
  AvatarUpload,
  CardUpload,
  CompactUpload,
  CoverUpload,
  DefaultUpload,
  ImageGridUpload,
  ImageUpload,
  ProgressUpload,
  SortableUpload,
  TableUpload,
} from "./file-upload.shared";

export type FileUploadPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const fileUploadPatternCatalog = [
  {
    name: "default",
    title: "Default Upload",
    description: "A simple upload field for a single image.",
    component: DefaultUpload,
  },
  {
    name: "avatar",
    title: "Avatar Upload",
    description: "A compact single-image uploader for avatars.",
    component: AvatarUpload,
  },
  {
    name: "compact",
    title: "Compact Upload",
    description: "A small dropzone for dense layouts and forms.",
    component: CompactUpload,
  },
  {
    name: "image-grid",
    title: "Image Grid Upload",
    description: "A gallery grid for multiple image attachments.",
    component: ImageGridUpload,
  },
  {
    name: "progress",
    title: "Progress Upload",
    description: "A list-style upload with progress indicators.",
    component: ProgressUpload,
  },
  {
    name: "table",
    title: "Table Upload",
    description: "A tabular layout for document-centric uploads.",
    component: TableUpload,
  },
  {
    name: "image",
    title: "Image Upload",
    description: "A visual image picker with large previews.",
    component: ImageUpload,
  },
  {
    name: "sortable",
    title: "Sortable Upload",
    description: "Drag-and-drop images to reorder them.",
    component: SortableUpload,
  },
  {
    name: "card",
    title: "Card Upload",
    description: "A card grid for mixed file uploads.",
    component: CardUpload,
  },
  {
    name: "cover",
    title: "Cover Upload",
    description: "A wide aspect-ratio uploader for cover images.",
    component: CoverUpload,
  },
] as const satisfies readonly FileUploadPatternSpec[];

export type FileUploadPatternName =
  (typeof fileUploadPatternCatalog)[number]["name"];

export const fileUploadPatternCount = fileUploadPatternCatalog.length;
export const fileUploadPatternNames = fileUploadPatternCatalog.map(
  (pattern) => pattern.name,
) as FileUploadPatternName[];
