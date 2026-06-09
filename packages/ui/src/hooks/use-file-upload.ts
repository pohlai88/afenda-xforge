import * as React from "react";

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  url: string;
  id: string;
}

export interface FileWithPreview {
  file: File | FileMetadata;
  id: string;
  preview?: string;
}

export interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileWithPreview[]) => void;
  onFilesAdded?: (files: FileWithPreview[]) => void;
  onError?: (errors: string[]) => void;
}

export type FileUploadInputProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    ref?: React.Ref<HTMLInputElement>;
  };

export type FileUploadState = {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
};

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  clearErrors: () => void;
  openFileDialog: () => void;
  getInputProps: (
    props?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => FileUploadInputProps;
  handleDragEnter: (event: React.DragEvent<HTMLElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLElement>) => void;
};

const DEFAULT_MAX_FILES = Number.POSITIVE_INFINITY;
const DEFAULT_MAX_SIZE = Number.POSITIVE_INFINITY;

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeAccept(accept?: string) {
  return accept
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function matchesAccept(file: File, accept?: string) {
  const tokens = normalizeAccept(accept);

  if (!tokens?.length || tokens.includes("*")) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return tokens.some((token) => {
    const normalized = token.toLowerCase();

    if (normalized.startsWith(".")) {
      return fileName.endsWith(normalized);
    }

    if (normalized.endsWith("/*")) {
      return fileType.startsWith(normalized.slice(0, -1));
    }

    return fileType === normalized;
  });
}

function toPreview(file: File) {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }

  return undefined;
}

function toUploadFile(file: File, createdUrls: string[]) {
  const preview = toPreview(file);

  if (preview) {
    createdUrls.push(preview);
  }

  return {
    id: createId(),
    file,
    preview,
  } satisfies FileWithPreview;
}

function toInitialUploadFile(file: FileMetadata) {
  return {
    id: file.id,
    file,
    preview: file.url || undefined,
  } satisfies FileWithPreview;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${Number.parseFloat(value.toFixed(decimals))} ${units[exponent]}`;
}

export function useFileUpload({
  maxFiles = DEFAULT_MAX_FILES,
  maxSize = DEFAULT_MAX_SIZE,
  accept = "*",
  multiple = false,
  initialFiles = [],
  onFilesChange,
  onFilesAdded,
  onError,
}: UseFileUploadOptions = {}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const createdUrlsRef = React.useRef<string[]>([]);
  const [files, setFiles] = React.useState<FileWithPreview[]>(
    initialFiles
      .slice(0, multiple ? initialFiles.length : 1)
      .map(toInitialUploadFile),
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const clearCreatedUrls = React.useCallback((urls: string[]) => {
    urls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
  }, []);

  React.useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  React.useEffect(() => {
    return () => {
      clearCreatedUrls(createdUrlsRef.current);
      createdUrlsRef.current = [];
    };
  }, [clearCreatedUrls]);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const emitErrors = React.useCallback(
    (nextErrors: string[]) => {
      setErrors(nextErrors);
      if (nextErrors.length > 0) {
        onError?.(nextErrors);
      }
    },
    [onError],
  );

  const addFiles = React.useCallback(
    (input: FileList | File[]) => {
      const incoming = Array.from(input);
      const nextErrors: string[] = [];

      const acceptedFiles = incoming.filter((file) => {
        if (!matchesAccept(file, accept)) {
          nextErrors.push(`"${file.name}" is not an accepted file type.`);
          return false;
        }

        if (file.size > maxSize) {
          nextErrors.push(`"${file.name}" exceeds the maximum size.`);
          return false;
        }

        return true;
      });

      if (!multiple && acceptedFiles.length > 1) {
        acceptedFiles.splice(1);
      }

      const limitedFiles = multiple
        ? acceptedFiles.slice(
            0,
            Number.isFinite(maxFiles)
              ? Math.max(maxFiles - files.length, 0)
              : acceptedFiles.length,
          )
        : acceptedFiles.slice(0, 1);

      if (acceptedFiles.length > limitedFiles.length) {
        nextErrors.push("Too many files selected.");
      }

      const createdUrls: string[] = [];
      const mappedFiles = limitedFiles.map((file) =>
        toUploadFile(file, createdUrls),
      );

      createdUrlsRef.current.push(...createdUrls);

      if (mappedFiles.length > 0) {
        setFiles((current) => {
          if (multiple) {
            return [...current, ...mappedFiles];
          }

          current.forEach((file) => {
            if (file.preview && createdUrlsRef.current.includes(file.preview)) {
              URL.revokeObjectURL(file.preview);
              createdUrlsRef.current = createdUrlsRef.current.filter(
                (url) => url !== file.preview,
              );
            }
          });

          return mappedFiles.slice(0, 1);
        });
        onFilesAdded?.(mappedFiles);
      }

      emitErrors(nextErrors);
    },
    [
      accept,
      emitErrors,
      files.length,
      maxFiles,
      maxSize,
      multiple,
      onFilesAdded,
    ],
  );

  const removeFile = React.useCallback((id: string) => {
    setFiles((current) => {
      const next = current.filter((file) => file.id !== id);
      const removed = current.find((file) => file.id === id);

      if (
        removed?.preview &&
        createdUrlsRef.current.includes(removed.preview)
      ) {
        URL.revokeObjectURL(removed.preview);
        createdUrlsRef.current = createdUrlsRef.current.filter(
          (url) => url !== removed.preview,
        );
      }

      return next;
    });
  }, []);

  const clearFiles = React.useCallback(() => {
    clearCreatedUrls(createdUrlsRef.current);
    createdUrlsRef.current = [];
    setFiles([]);
  }, [clearCreatedUrls]);

  const openFileDialog = React.useCallback(() => {
    inputRef.current?.click();
  }, []);

  const getInputProps = React.useCallback(
    (props: React.InputHTMLAttributes<HTMLInputElement> = {}) => ({
      ...props,
      ref: inputRef,
      type: "file" as const,
      accept,
      multiple,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange?.(event);
        if (event.target.files) {
          addFiles(event.target.files);
        }
        event.target.value = "";
      },
    }),
    [accept, addFiles, multiple],
  );

  const handleDragEnter = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [],
  );

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.currentTarget === event.target) {
        setIsDragging(false);
      }
    },
    [],
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [],
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      if (event.dataTransfer.files.length > 0) {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles],
  );

  return [
    { files, isDragging, errors } satisfies FileUploadState,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    } satisfies FileUploadActions,
  ] as const;
}
