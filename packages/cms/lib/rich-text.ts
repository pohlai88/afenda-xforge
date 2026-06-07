import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { slugify } from "@repo/shared";
import type { CmsRichText, TocItem } from "../types.ts";

type RichTextNode = {
  children?: RichTextNode[];
  tag?: string;
  text?: string;
  type?: string;
};

export type CmsRichTextInput =
  | CmsRichText
  | SerializedEditorState
  | null
  | undefined;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isSerializedEditorState = (
  value: unknown
): value is SerializedEditorState => {
  if (!isRecord(value)) {
    return false;
  }

  return isRecord(value.root);
};

export const resolveRichTextData = (
  value: CmsRichTextInput
): SerializedEditorState | null => {
  if (!value) {
    return null;
  }

  if (isSerializedEditorState(value)) {
    return value;
  }

  if ("lexical" in value && isSerializedEditorState(value.lexical)) {
    return value.lexical;
  }

  return null;
};

const collectText = (nodes: RichTextNode[] | undefined): string => {
  if (!nodes) {
    return "";
  }

  return nodes
    .flatMap((node) => {
      const ownText = typeof node.text === "string" ? [node.text] : [];
      const childText = node.children ? [collectText(node.children)] : [];

      return [...ownText, ...childText];
    })
    .join("")
    .trim();
};

const collectHeadings = (
  nodes: RichTextNode[] | undefined,
  headings: TocItem[]
): void => {
  if (!nodes) {
    return;
  }

  for (const node of nodes) {
    if (node.type === "heading") {
      const text = collectText(node.children);
      const tag = node.tag ?? "h2";
      const level = Number.parseInt(tag.replace("h", ""), 10);

      if (text) {
        headings.push({
          id: slugify(text),
          level: Number.isFinite(level) ? level : 2,
          text,
        });
      }
    }

    if (node.children) {
      collectHeadings(node.children, headings);
    }
  }
};

export const getTableOfContents = (value: CmsRichTextInput): TocItem[] => {
  const lexical = resolveRichTextData(value);

  if (!(lexical && "children" in lexical.root)) {
    return [];
  }

  const headings: TocItem[] = [];
  const rootChildren = Array.isArray(lexical.root.children)
    ? (lexical.root.children as RichTextNode[])
    : [];

  collectHeadings(rootChildren, headings);

  return headings;
};
