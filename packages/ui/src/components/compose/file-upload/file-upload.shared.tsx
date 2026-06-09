"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUpDown,
  FileText,
  FolderUp,
  GripVertical,
  ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import type {
  FileMetadata,
  FileWithPreview,
} from "../../../hooks/use-file-upload";
import { formatBytes, useFileUpload } from "../../../hooks/use-file-upload";
import { cn } from "../../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui-shadcn/avatar";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui-shadcn/table";

type PatternCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

type DemoFile = FileMetadata;

function createSvgDataUrl(
  label: string,
  background: string,
  foreground = "#ffffff",
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="48" fill="url(#g)" />
      <circle cx="640" cy="120" r="96" fill="rgba(255,255,255,0.08)" />
      <circle cx="180" cy="460" r="140" fill="rgba(255,255,255,0.08)" />
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700" fill="${foreground}">
        ${label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createDemoFile(
  id: string,
  name: string,
  size: number,
  type: string,
  label: string,
  background: string,
): DemoFile {
  return {
    id,
    name,
    size,
    type,
    url: createSvgDataUrl(label, background),
  };
}

const avatarFiles = [
  createDemoFile(
    "avatar-1",
    "avatar-1.png",
    44576,
    "image/png",
    "AV",
    "#2563eb",
  ),
];

const galleryFiles = [
  createDemoFile(
    "gallery-1",
    "avatar-1.png",
    44576,
    "image/png",
    "01",
    "#0ea5e9",
  ),
  createDemoFile(
    "gallery-2",
    "avatar-2.png",
    41160,
    "image/png",
    "02",
    "#7c3aed",
  ),
  createDemoFile(
    "gallery-3",
    "avatar-3.png",
    49920,
    "image/png",
    "03",
    "#0891b2",
  ),
];

const progressFiles = [
  createDemoFile(
    "progress-1",
    "image-1.png",
    41060,
    "image/png",
    "A1",
    "#14b8a6",
  ),
  createDemoFile(
    "progress-2",
    "image-2.png",
    61330,
    "image/png",
    "A2",
    "#f97316",
  ),
];

const tableFiles = [
  createDemoFile(
    "table-1",
    "document.pdf",
    516850,
    "application/pdf",
    "PDF",
    "#dc2626",
  ),
  createDemoFile(
    "table-2",
    "intro.zip",
    246920,
    "application/zip",
    "ZIP",
    "#0f766e",
  ),
  createDemoFile(
    "table-3",
    "conclusion.xlsx",
    344850,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "XLS",
    "#16a34a",
  ),
  createDemoFile(
    "table-4",
    "package.json",
    697,
    "application/json",
    "JSON",
    "#334155",
  ),
];

const imageFiles = [
  createDemoFile(
    "image-1",
    "Product view 1",
    1240000,
    "image/jpeg",
    "P1",
    "#0f172a",
  ),
  createDemoFile(
    "image-2",
    "Product view 2",
    1380000,
    "image/jpeg",
    "P2",
    "#1d4ed8",
  ),
  createDemoFile(
    "image-3",
    "Product view 3",
    970000,
    "image/jpeg",
    "P3",
    "#7c2d12",
  ),
  createDemoFile(
    "image-4",
    "Product view 4",
    1120000,
    "image/jpeg",
    "P4",
    "#4c1d95",
  ),
];

const sortableFiles = [
  createDemoFile(
    "sortable-1",
    "Product view 1",
    1240000,
    "image/jpeg",
    "1",
    "#0f172a",
  ),
  createDemoFile(
    "sortable-2",
    "Product view 2",
    1380000,
    "image/jpeg",
    "2",
    "#1d4ed8",
  ),
  createDemoFile(
    "sortable-3",
    "Product view 3",
    970000,
    "image/jpeg",
    "3",
    "#7c2d12",
  ),
  createDemoFile(
    "sortable-4",
    "Product view 4",
    1120000,
    "image/jpeg",
    "4",
    "#4c1d95",
  ),
  createDemoFile(
    "sortable-5",
    "Product view 5",
    1210000,
    "image/jpeg",
    "5",
    "#0f766e",
  ),
];

const cardFiles = [
  createDemoFile(
    "card-1",
    "intro.zip",
    246920,
    "application/zip",
    "ZIP",
    "#0f766e",
  ),
  createDemoFile(
    "card-2",
    "image-01.jpg",
    1460000,
    "image/jpeg",
    "JPG",
    "#2563eb",
  ),
  createDemoFile(
    "card-3",
    "audio.mp3",
    1460000,
    "audio/mpeg",
    "MP3",
    "#7c3aed",
  ),
];

const coverFiles = [
  createDemoFile("cover-1", "Cover", 1860000, "image/jpeg", "Cover", "#0f172a"),
];

function FileUploadPatternCard({
  title,
  description,
  children,
}: PatternCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function getFileName(file?: FileWithPreview) {
  if (!file) {
    return "";
  }

  return file.file instanceof File ? file.file.name : file.file.name;
}

function getFileSize(file?: FileWithPreview) {
  if (!file) {
    return 0;
  }

  return file.file instanceof File ? file.file.size : file.file.size;
}

function getFileType(file?: FileWithPreview) {
  if (!file) {
    return "";
  }

  return file.file instanceof File ? file.file.type : file.file.type;
}

function getFileUrl(file?: FileWithPreview) {
  if (!file) {
    return undefined;
  }

  if (file.preview) {
    return file.preview;
  }

  return file.file instanceof File ? undefined : file.file.url;
}

function getTypeBadge(type: string) {
  if (type.startsWith("image/")) {
    return "Image";
  }
  if (type.startsWith("audio/")) {
    return "Audio";
  }
  if (type.startsWith("video/")) {
    return "Video";
  }
  if (type.includes("pdf")) {
    return "PDF";
  }
  if (type.includes("zip")) {
    return "Archive";
  }
  if (type.includes("sheet") || type.includes("excel")) {
    return "Sheet";
  }
  if (type.includes("json")) {
    return "JSON";
  }

  return "File";
}

function UploadDropzone({
  title,
  description,
  hint,
  children,
  className,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: {
  title: string;
  description?: string;
  hint?: string;
  children?: React.ReactNode;
  className?: string;
  isDragging?: boolean;
  onDragEnter?: React.DragEventHandler<HTMLFieldSetElement>;
  onDragLeave?: React.DragEventHandler<HTMLFieldSetElement>;
  onDragOver?: React.DragEventHandler<HTMLFieldSetElement>;
  onDrop?: React.DragEventHandler<HTMLFieldSetElement>;
}) {
  return (
    <fieldset
      className={cn(
        "rounded-xl border border-dashed bg-muted/20 p-4 transition-colors",
        isDragging && "border-primary bg-primary/5",
        className,
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
          <Upload className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {children}
      </div>
    </fieldset>
  );
}

function FileThumb({
  file,
  compact = false,
}: {
  file: FileWithPreview;
  compact?: boolean;
}) {
  const preview = getFileUrl(file);
  const name = getFileName(file);
  const type = getFileType(file);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background",
        compact ? "flex items-center gap-3 p-3" : "p-3",
      )}
    >
      {preview ? (
        <img
          alt={name}
          className={cn(
            "bg-muted object-cover",
            compact
              ? "size-12 rounded-md"
              : "mb-3 aspect-[4/3] w-full rounded-md",
          )}
          src={preview}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-md bg-muted text-muted-foreground",
            compact ? "size-12" : "mb-3 aspect-[4/3] w-full",
          )}
        >
          <FileText className="size-6" />
        </div>
      )}
      <div className={cn("min-w-0", compact && "flex-1")}>
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" size="xs">
            {getTypeBadge(type)}
          </Badge>
          <span>{formatBytes(getFileSize(file))}</span>
        </div>
      </div>
    </div>
  );
}

function FileRow({
  file,
  onRemove,
}: {
  file: FileWithPreview;
  onRemove: (id: string) => void;
}) {
  const name = getFileName(file);
  const type = getFileType(file);

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {getFileUrl(file) ? (
            <img
              alt={name}
              className="size-8 rounded-md object-cover"
              src={getFileUrl(file)}
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <FileText className="size-4" />
            </div>
          )}
          <span>{name}</span>
        </div>
      </TableCell>
      <TableCell>{getTypeBadge(type)}</TableCell>
      <TableCell>{formatBytes(getFileSize(file))}</TableCell>
      <TableCell className="text-right">
        <Button
          aria-label={`Remove ${name}`}
          size="icon"
          variant="ghost"
          onClick={() => onRemove(file.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function SortableThumb({
  file,
  onRemove,
}: {
  file: FileWithPreview;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style}>
      <FileThumb file={file} />
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
          {...attributes}
          {...listeners}
          type="button"
        >
          <GripVertical className="size-3.5" />
          Drag
        </button>
        <Button
          aria-label={`Remove ${getFileName(file)}`}
          disabled={isDragging}
          size="icon"
          variant="ghost"
          onClick={() => onRemove(file.id)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function FileUploadToolbar({
  files,
  onAdd,
  onClear,
  addLabel = "Browse files",
  clearLabel = "Clear all",
}: {
  files: FileWithPreview[];
  onAdd: () => void;
  onClear: () => void;
  addLabel?: string;
  clearLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button onClick={onAdd}>
        <Plus className="size-4" />
        {addLabel}
      </Button>
      <Button disabled={files.length === 0} variant="outline" onClick={onClear}>
        <Trash2 className="size-4" />
        {clearLabel}
      </Button>
    </div>
  );
}

function DefaultUpload() {
  const [{ files, isDragging }, actions] = useFileUpload({
    accept: "image/*",
    multiple: false,
  });

  return (
    <FileUploadPatternCard
      title="Default upload"
      description="A simple upload field for a single image."
    >
      <div className="space-y-4 rounded-xl border bg-muted/10 p-4">
        <UploadDropzone
          description="Drag and drop a file here or click to browse."
          hint="PNG, JPG up to 2MB"
          isDragging={isDragging}
          title="Upload image"
        >
          <Button onClick={actions.openFileDialog} type="button">
            <FolderUp className="size-4" />
            Browse file
          </Button>
          <input className="sr-only" {...actions.getInputProps()} />
        </UploadDropzone>

        {files.length > 0 ? (
          <FileThumb file={files[0]} compact />
        ) : (
          <div className="rounded-lg border bg-background px-4 py-3 text-sm text-muted-foreground">
            No image attached
          </div>
        )}
      </div>
    </FileUploadPatternCard>
  );
}

export function AvatarUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "image/*",
    multiple: false,
    initialFiles: avatarFiles,
  });
  const current = files[0];

  return (
    <FileUploadPatternCard
      title="Avatar upload"
      description="A single image uploader with a compact avatar preview."
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-20 rounded-2xl border">
          <AvatarImage alt="Avatar" src={getFileUrl(current)} />
          <AvatarFallback className="rounded-2xl bg-muted text-base">
            UP
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-3">
          <div>
            <div className="text-sm font-medium">Upload avatar</div>
            <div className="text-sm text-muted-foreground">
              PNG, JPG up to 2MB
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={actions.openFileDialog}>Change avatar</Button>
            <Button
              disabled={files.length === 0}
              variant="outline"
              onClick={actions.clearFiles}
            >
              Remove
            </Button>
          </div>
          <input className="sr-only" {...actions.getInputProps()} />
        </div>
      </div>
    </FileUploadPatternCard>
  );
}

function CompactUpload() {
  const [{ files, isDragging }, actions] = useFileUpload({
    accept: "*",
    maxFiles: 3,
    multiple: true,
  });

  return (
    <FileUploadPatternCard
      title="Compact upload"
      description="A concise drop zone with a small file list."
    >
      <UploadDropzone
        className="p-3"
        description="Drop files here or click to browse"
        hint="Max 3 files"
        isDragging={isDragging}
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
        title="Add files"
      >
        <Button
          onClick={actions.openFileDialog}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Plus className="size-4" />
          Add files
        </Button>
        <input className="sr-only" {...actions.getInputProps()} />
      </UploadDropzone>

      <div className="grid gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {getFileName(file)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(getFileSize(file))}
              </div>
            </div>
            <Button
              aria-label={`Remove ${getFileName(file)}`}
              size="icon"
              variant="ghost"
              onClick={() => actions.removeFile(file.id)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </FileUploadPatternCard>
  );
}

function GalleryUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "image/*",
    initialFiles: galleryFiles,
    maxFiles: 10,
    multiple: true,
  });
  const total = files.reduce((sum, file) => sum + getFileSize(file), 0);

  return (
    <FileUploadPatternCard
      title="Gallery upload"
      description="Upload images into a compact gallery grid."
    >
      <UploadDropzone
        description="Drag and drop images here or click to browse"
        hint="PNG, JPG, GIF up to 5MB each"
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
        title="Upload images to gallery"
      >
        <Button onClick={actions.openFileDialog} type="button">
          <ImageIcon className="size-4" />
          Select images
        </Button>
        <input className="sr-only" {...actions.getInputProps()} />
      </UploadDropzone>

      <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
        <span className="font-medium">Gallery ({files.length}/10)</span>
        <span className="text-muted-foreground">
          Total: {formatBytes(total)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <div key={file.id} className="space-y-2">
            <FileThumb file={file} />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => actions.removeFile(file.id)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button
        disabled={files.length === 0}
        onClick={actions.clearFiles}
        variant="ghost"
      >
        Clear all
      </Button>
    </FileUploadPatternCard>
  );
}

function ProgressUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "*",
    initialFiles: progressFiles,
    maxFiles: 10,
    multiple: true,
  });

  return (
    <FileUploadPatternCard
      title="Progress upload"
      description="Shows a completed upload list with progress styling."
    >
      <UploadDropzone
        description="Drag and drop files here or click to browse"
        hint="Support for multiple file types up to 10MB each"
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
        title="Upload your files"
      >
        <Button
          onClick={actions.openFileDialog}
          type="button"
          variant="secondary"
        >
          <Plus className="size-4" />
          Select files
        </Button>
        <input className="sr-only" {...actions.getInputProps()} />
      </UploadDropzone>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
        <span className="font-medium">Upload Progress</span>
        <span className="text-muted-foreground">Completed: {files.length}</span>
      </div>

      <div className="space-y-3">
        {files.map((file, index) => {
          const progress = Math.min(100, 55 + index * 18);

          return (
            <div key={file.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <FileThumb file={file} compact />
                <Button
                  aria-label={`Remove ${getFileName(file)}`}
                  size="icon"
                  variant="ghost"
                  onClick={() => actions.removeFile(file.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <Button
        disabled={files.length === 0}
        onClick={actions.clearFiles}
        variant="outline"
      >
        Clear all
      </Button>
    </FileUploadPatternCard>
  );
}

function TableUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "*",
    initialFiles: tableFiles,
    maxFiles: 10,
    multiple: true,
  });

  return (
    <FileUploadPatternCard
      title="Table upload"
      description="A dense file table for structured uploads."
    >
      <UploadDropzone
        description="Drop files here or click browse files"
        hint="Maximum file size: 50MB • Maximum files: 10"
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
        title="Drop files here"
      >
        <div className="flex gap-2">
          <Button
            onClick={actions.openFileDialog}
            type="button"
            variant="secondary"
          >
            Add files
          </Button>
          <Button
            onClick={actions.openFileDialog}
            type="button"
            variant="outline"
          >
            Browse files
          </Button>
        </div>
        <input className="sr-only" {...actions.getInputProps()} />
      </UploadDropzone>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">Files ({files.length})</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={actions.openFileDialog}>
            Add files
          </Button>
          <Button size="sm" variant="ghost" onClick={actions.clearFiles}>
            Remove all
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onRemove={actions.removeFile}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </FileUploadPatternCard>
  );
}

function ImageUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "image/*",
    initialFiles: imageFiles,
    maxFiles: 4,
    multiple: true,
  });

  return (
    <FileUploadPatternCard
      title="Image upload"
      description="A visual image picker with a large preview grid."
    >
      <UploadDropzone
        description="Choose a file or drag & drop here."
        hint="JPEG, PNG, up to 2 MB."
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
        title="Upload images"
      >
        <Button onClick={actions.openFileDialog} type="button">
          <ImageIcon className="size-4" />
          Browse file
        </Button>
        <input className="sr-only" {...actions.getInputProps()} />
      </UploadDropzone>

      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((file) => (
          <div key={file.id} className="overflow-hidden rounded-lg border">
            <img
              alt={getFileName(file)}
              className="aspect-[4/3] w-full object-cover"
              src={getFileUrl(file)}
            />
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {getFileName(file)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(getFileSize(file))}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => actions.removeFile(file.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </FileUploadPatternCard>
  );
}

function SortableUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "image/*",
    initialFiles: sortableFiles,
    maxFiles: 5,
    multiple: true,
  });
  const [items, setItems] = React.useState(files);

  React.useEffect(() => {
    setItems(files);
  }, [files]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <FileUploadPatternCard
      title="Sortable upload"
      description="Drag images to reorder them in the gallery."
    >
      <UploadDropzone
        description="Choose a file or drag & drop here."
        hint="JPEG, PNG, up to 10 MB."
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
        title="Upload up to 5 images"
      >
        <Button onClick={actions.openFileDialog} type="button">
          <ArrowUpDown className="size-4" />
          Browse file
        </Button>
        <input className="sr-only" {...actions.getInputProps()} />
      </UploadDropzone>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over || active.id === over.id) {
            return;
          }

          setItems((current) => {
            const oldIndex = current.findIndex((item) => item.id === active.id);
            const newIndex = current.findIndex((item) => item.id === over.id);
            return arrayMove(current, oldIndex, newIndex);
          });
        }}
        sensors={sensors}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((file) => (
              <SortableThumb
                key={file.id}
                file={file}
                onRemove={actions.removeFile}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </FileUploadPatternCard>
  );
}

function CardUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "*",
    initialFiles: cardFiles,
    maxFiles: 10,
    multiple: true,
  });

  return (
    <FileUploadPatternCard
      title="Card upload"
      description="A card-based file gallery with file metadata."
    >
      <UploadDropzone
        description="Drop files here or browse files"
        hint="Maximum file size: 50MB • Maximum files: 10"
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
        title="Files"
      >
        <div className="flex gap-2">
          <Button onClick={actions.openFileDialog} type="button">
            <Plus className="size-4" />
            Add files
          </Button>
          <Button type="button" variant="outline" onClick={actions.clearFiles}>
            <Trash2 className="size-4" />
            Remove all
          </Button>
        </div>
        <input className="sr-only" {...actions.getInputProps()} />
      </UploadDropzone>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <div key={file.id} className="rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {getFileUrl(file) ? (
                <img
                  alt={getFileName(file)}
                  className="size-12 rounded-md object-cover"
                  src={getFileUrl(file)}
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {getFileName(file)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(getFileSize(file))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => actions.removeFile(file.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </FileUploadPatternCard>
  );
}

function CoverUpload() {
  const [{ files }, actions] = useFileUpload({
    accept: "image/*",
    initialFiles: coverFiles,
    maxFiles: 1,
    multiple: false,
  });

  const cover = files[0];

  return (
    <FileUploadPatternCard
      title="Cover upload"
      description="A wide cover image uploader with replacement controls."
    >
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border bg-muted/20">
          {cover ? (
            <div className="relative aspect-[21/9] w-full">
              <img
                alt="Cover"
                className="h-full w-full object-cover"
                src={getFileUrl(cover)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                Cover
              </div>
            </div>
          ) : (
            <div className="flex aspect-[21/9] items-center justify-center text-sm text-muted-foreground">
              No cover image
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={actions.openFileDialog}>
            <ImageIcon className="size-4" />
            Change Cover
          </Button>
          <Button
            disabled={!cover}
            variant="outline"
            onClick={() => {
              if (cover) {
                actions.removeFile(cover.id);
              }
            }}
          >
            Remove
          </Button>
        </div>
        <input className="sr-only" {...actions.getInputProps()} />
        <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">
            Cover Image Guidelines
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Use high-quality images with good lighting and composition</li>
            <li>Recommended aspect ratio: 21:9 (ultrawide)</li>
            <li>Avoid important content near the edges</li>
            <li>Supported formats: JPG, PNG, WebP</li>
          </ul>
        </div>
      </div>
    </FileUploadPatternCard>
  );
}

export {
  avatarFiles,
  CardUpload,
  CompactUpload,
  CoverUpload,
  cardFiles,
  coverFiles,
  DefaultUpload,
  type DemoFile,
  FileRow,
  FileThumb,
  FileUploadPatternCard,
  FileUploadToolbar,
  formatBytes,
  GalleryUpload,
  galleryFiles,
  ImageUpload,
  imageFiles,
  type PatternCardProps,
  ProgressUpload,
  progressFiles,
  SortableUpload,
  sortableFiles,
  TableUpload,
  tableFiles,
  useFileUpload,
};
