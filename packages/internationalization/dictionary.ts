import "server-only";
import type { XforgeLocale } from "./locales.ts";
import { defaultLocale, resolveLocale, supportedLocales } from "./locales.ts";

export type MessageValue = MessageDictionary | string;

export type MessageDictionary = {
  [key: string]: MessageValue;
};

export type MessageParameters = Record<string, number | string>;

export type DictionaryTranslator = {
  dictionary: MessageDictionary;
  locale: XforgeLocale;
  t: (key: string, parameters?: MessageParameters) => string;
};

const dictionaries: Record<XforgeLocale, () => Promise<MessageDictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  vi: () => import("./dictionaries/vi.json").then((module) => module.default),
};

export const getDictionary = (locale: string): Promise<MessageDictionary> => {
  const resolvedLocale = resolveLocale(locale, {
    fallbackLocale: defaultLocale,
    supportedLocales,
  });

  return dictionaries[resolvedLocale]();
};

export const getMessageValue = (
  dictionary: MessageDictionary,
  key: string
): string | undefined => {
  const parts = key.split(".");
  let current: MessageValue | undefined = dictionary;

  for (const part of parts) {
    if (!current || typeof current === "string") {
      return;
    }

    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
};

export const interpolateMessage = (
  message: string,
  parameters: MessageParameters = {}
): string =>
  Object.entries(parameters).reduce(
    (current, [key, value]) => current.replaceAll(`{{${key}}}`, String(value)),
    message
  );

export const translateDictionary = (
  dictionary: MessageDictionary,
  key: string,
  parameters?: MessageParameters,
  fallbackDictionary?: MessageDictionary
): string => {
  const message =
    getMessageValue(dictionary, key) ??
    (fallbackDictionary ? getMessageValue(fallbackDictionary, key) : undefined);

  if (!message) {
    return key;
  }

  return interpolateMessage(message, parameters);
};

export const createTranslator = async (
  locale: string
): Promise<DictionaryTranslator> => {
  const resolvedLocale = resolveLocale(locale, {
    fallbackLocale: defaultLocale,
    supportedLocales,
  });
  const dictionary = await dictionaries[resolvedLocale]();
  const fallbackDictionary =
    resolvedLocale === defaultLocale
      ? dictionary
      : await dictionaries[defaultLocale]();

  return {
    dictionary,
    locale: resolvedLocale,
    t: (key: string, parameters?: MessageParameters): string =>
      translateDictionary(dictionary, key, parameters, fallbackDictionary),
  };
};
