import type { SearchIndexDefinition } from "./types.ts";

export type SearchLanguagePreset = "en" | "vi";

export const VIETNAMESE_SEARCH_STOP_WORDS = [
  "anh",
  "bang",
  "bi",
  "boi",
  "cai",
  "cho",
  "co",
  "cua",
  "de",
  "den",
  "duoc",
  "duoi",
  "la",
  "mot",
  "nhung",
  "o",
  "tren",
  "trong",
  "tu",
  "va",
  "voi",
] as const;

export const ENGLISH_SEARCH_STOP_WORDS = [
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
] as const;

type SearchLanguagePresetConfig = {
  stopWords: readonly string[];
};

export const SEARCH_LANGUAGE_PRESETS: Record<
  SearchLanguagePreset,
  SearchLanguagePresetConfig
> = {
  en: {
    stopWords: ENGLISH_SEARCH_STOP_WORDS,
  },
  vi: {
    stopWords: VIETNAMESE_SEARCH_STOP_WORDS,
  },
};

export const applySearchLanguagePreset = (
  definition: SearchIndexDefinition,
  preset: SearchLanguagePreset
): SearchIndexDefinition => ({
  ...definition,
  stopWords: definition.stopWords ?? [
    ...SEARCH_LANGUAGE_PRESETS[preset].stopWords,
  ],
});
