import type { MetadataStatusTone } from "./presentation.contract.ts";

export const metadataUiStates = [
  "loading",
  "empty",
  "error",
  "forbidden",
  "ready",
] as const;

export type MetadataUiState = (typeof metadataUiStates)[number];

export type MetadataStateContract = {
  description?: string;
  key: string;
  label: string;
  tone?: MetadataStatusTone;
  uiState: MetadataUiState;
};
