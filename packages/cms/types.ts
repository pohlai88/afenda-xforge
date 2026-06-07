import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

export type CmsImage = {
  alt?: string | null;
  blurDataURL?: string | null;
  height?: number | null;
  url: string;
  width?: number | null;
};

export type CmsAuthor = {
  avatar?: CmsImage | null;
  name: string;
  xUrl?: string | null;
};

export type CmsCategory = {
  title: string;
};

export type CmsRichText = {
  html?: string | null;
  lexical?: SerializedEditorState | null;
  plainText?: string | null;
  readingTime?: number | null;
};

export type TocItem = {
  id: string;
  level: number;
  text: string;
};

export type CmsQueryDefinition = {
  collection: string;
  limit?: number;
  sort?: string;
  where?: Readonly<Record<string, string>>;
};

export type PostMeta = {
  authors: CmsAuthor[];
  categories: CmsCategory[];
  date?: string | null;
  description?: string | null;
  image?: CmsImage | null;
  slug: string;
  title: string;
};

export type Post = PostMeta & {
  body: CmsRichText;
};

export type LegalPostMeta = {
  description?: string | null;
  slug: string;
  title: string;
};

export type LegalPost = LegalPostMeta & {
  body: CmsRichText;
};
