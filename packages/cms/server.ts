import "server-only";

import { loadCmsKeys } from "./keys.js";
import type {
  CmsImage,
  CmsQueryDefinition,
  CmsRichText,
  LegalPost,
  LegalPostMeta,
  Post,
  PostMeta,
} from "./types.js";

type PayloadImage = {
  alt?: string | null;
  blurDataURL?: string | null;
  height?: number | null;
  url?: string | null;
  width?: number | null;
};

type PayloadAuthor = {
  avatar?: PayloadImage | null;
  name?: string | null;
  xUrl?: string | null;
};

type PayloadCategory = {
  title?: string | null;
};

type PayloadRichText = {
  root?: unknown;
};

type PayloadPostDocument = {
  authors?: PayloadAuthor[] | null;
  body?: PayloadRichText | null;
  categories?: PayloadCategory[] | null;
  date?: string | null;
  description?: string | null;
  image?: PayloadImage | null;
  slug?: string | null;
  title?: string | null;
};

type PayloadLegalDocument = {
  body?: PayloadRichText | null;
  description?: string | null;
  slug?: string | null;
  title?: string | null;
};

type PayloadFindResponse<TDocument> = {
  docs?: TDocument[];
};

type BlogApi = {
  getLatestPost: () => Promise<Post | null>;
  getPost: (slug: string) => Promise<Post | null>;
  getPosts: () => Promise<PostMeta[]>;
  latestPostQuery: CmsQueryDefinition;
  postQuery: (slug: string) => CmsQueryDefinition;
  postsQuery: CmsQueryDefinition;
};

type LegalApi = {
  getLatestPost: () => Promise<LegalPost | null>;
  getPost: (slug: string) => Promise<LegalPost | null>;
  getPosts: () => Promise<LegalPost[]>;
  getPostsMeta: () => Promise<LegalPostMeta[]>;
  latestPostQuery: CmsQueryDefinition;
  postQuery: (slug: string) => CmsQueryDefinition;
  postsMetaQuery: CmsQueryDefinition;
  postsQuery: CmsQueryDefinition;
};

const normalizeApiPath = (value: string): string => value.replace(/\/+$/, "");

const buildAuthHeader = (): string | null => {
  const { PAYLOAD_API_KEY, PAYLOAD_API_KEY_COLLECTION, PAYLOAD_JWT } =
    loadCmsKeys();

  if (PAYLOAD_JWT) {
    return `JWT ${PAYLOAD_JWT}`;
  }

  if (PAYLOAD_API_KEY) {
    return `${PAYLOAD_API_KEY_COLLECTION} API-Key ${PAYLOAD_API_KEY}`;
  }

  return null;
};

const createCollectionUrl = ({
  collection,
  limit,
  sort,
  where,
}: CmsQueryDefinition): URL | null => {
  const { PAYLOAD_API_PATH, PAYLOAD_SERVER_URL } = loadCmsKeys();

  if (!PAYLOAD_SERVER_URL) {
    return null;
  }

  const basePath = `${normalizeApiPath(PAYLOAD_API_PATH)}/${collection}`;
  const url = new URL(basePath.replace(/^\//, ""), `${PAYLOAD_SERVER_URL}/`);

  url.searchParams.set("depth", "1");

  if (typeof limit === "number") {
    url.searchParams.set("limit", String(limit));
  }

  if (sort) {
    url.searchParams.set("sort", sort);
  }

  for (const [field, value] of Object.entries(where ?? {})) {
    url.searchParams.set(`where[${field}][equals]`, value);
  }

  return url;
};

const fetchDocuments = async <TDocument>(
  definition: CmsQueryDefinition
): Promise<TDocument[]> => {
  const url = createCollectionUrl(definition);

  if (!url) {
    return [];
  }

  const authHeader = buildAuthHeader();
  const headers = authHeader ? { Authorization: authHeader } : undefined;

  try {
    const response = await fetch(url, {
      headers,
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as PayloadFindResponse<TDocument>;

    return payload.docs ?? [];
  } catch {
    return [];
  }
};

const mapImage = (image: PayloadImage | null | undefined): CmsImage | null => {
  if (!image?.url) {
    return null;
  }

  return {
    alt: image.alt ?? null,
    blurDataURL: image.blurDataURL ?? null,
    height: image.height ?? null,
    url: image.url,
    width: image.width ?? null,
  };
};

const mapRichText = (
  body: PayloadRichText | null | undefined
): CmsRichText => ({
  lexical:
    body && typeof body === "object" && "root" in body
      ? (body as CmsRichText["lexical"])
      : null,
});

const mapPostMeta = (document: PayloadPostDocument): PostMeta | null => {
  if (!(document.slug && document.title)) {
    return null;
  }

  return {
    authors: (document.authors ?? [])
      .filter(
        (author): author is PayloadAuthor & { name: string } => !!author?.name
      )
      .map((author) => ({
        avatar: mapImage(author.avatar),
        name: author.name,
        xUrl: author.xUrl ?? null,
      })),
    categories: (document.categories ?? [])
      .filter(
        (category): category is PayloadCategory & { title: string } =>
          !!category?.title
      )
      .map((category) => ({
        title: category.title,
      })),
    date: document.date ?? null,
    description: document.description ?? null,
    image: mapImage(document.image),
    slug: document.slug,
    title: document.title,
  };
};

const mapPost = (document: PayloadPostDocument): Post | null => {
  const meta = mapPostMeta(document);

  if (!meta) {
    return null;
  }

  return {
    ...meta,
    body: mapRichText(document.body),
  };
};

const mapLegalMeta = (document: PayloadLegalDocument): LegalPostMeta | null => {
  if (!(document.slug && document.title)) {
    return null;
  }

  return {
    description: document.description ?? null,
    slug: document.slug,
    title: document.title,
  };
};

const mapLegalPost = (document: PayloadLegalDocument): LegalPost | null => {
  const meta = mapLegalMeta(document);

  if (!meta) {
    return null;
  }

  return {
    ...meta,
    body: mapRichText(document.body),
  };
};

const getPostsCollection = (): string => "posts";

const getLegalPagesCollection = (): string => "legal-pages";

export const blog: BlogApi = {
  postsQuery: {
    collection: getPostsCollection(),
    sort: "-date",
  } satisfies CmsQueryDefinition,

  latestPostQuery: {
    collection: getPostsCollection(),
    limit: 1,
    sort: "-date",
  } satisfies CmsQueryDefinition,

  postQuery: (slug: string): CmsQueryDefinition => ({
    collection: getPostsCollection(),
    limit: 1,
    where: {
      slug,
    },
  }),

  getPosts: async (): Promise<PostMeta[]> => {
    const documents = await fetchDocuments<PayloadPostDocument>({
      collection: getPostsCollection(),
      sort: "-date",
    });

    return documents
      .map((document) => mapPostMeta(document))
      .filter((document): document is PostMeta => document !== null);
  },

  getLatestPost: async (): Promise<Post | null> => {
    const documents = await fetchDocuments<PayloadPostDocument>({
      collection: getPostsCollection(),
      limit: 1,
      sort: "-date",
    });

    return documents.map((document) => mapPost(document)).find(Boolean) ?? null;
  },

  getPost: async (slug: string): Promise<Post | null> => {
    const documents = await fetchDocuments<PayloadPostDocument>({
      collection: getPostsCollection(),
      limit: 1,
      where: {
        slug,
      },
    });

    return documents.map((document) => mapPost(document)).find(Boolean) ?? null;
  },
};

export const legal: LegalApi = {
  postsMetaQuery: {
    collection: getLegalPagesCollection(),
    sort: "title",
  } satisfies CmsQueryDefinition,

  postsQuery: {
    collection: getLegalPagesCollection(),
    sort: "title",
  } satisfies CmsQueryDefinition,

  latestPostQuery: {
    collection: getLegalPagesCollection(),
    limit: 1,
    sort: "-updatedAt",
  } satisfies CmsQueryDefinition,

  postQuery: (slug: string): CmsQueryDefinition => ({
    collection: getLegalPagesCollection(),
    limit: 1,
    where: {
      slug,
    },
  }),

  getPostsMeta: async (): Promise<LegalPostMeta[]> => {
    const documents = await fetchDocuments<PayloadLegalDocument>({
      collection: getLegalPagesCollection(),
      sort: "title",
    });

    return documents
      .map((document) => mapLegalMeta(document))
      .filter((document): document is LegalPostMeta => document !== null);
  },

  getPosts: async (): Promise<LegalPost[]> => {
    const documents = await fetchDocuments<PayloadLegalDocument>({
      collection: getLegalPagesCollection(),
      sort: "title",
    });

    return documents
      .map((document) => mapLegalPost(document))
      .filter((document): document is LegalPost => document !== null);
  },

  getLatestPost: async (): Promise<LegalPost | null> => {
    const documents = await fetchDocuments<PayloadLegalDocument>({
      collection: getLegalPagesCollection(),
      limit: 1,
      sort: "-updatedAt",
    });

    return (
      documents.map((document) => mapLegalPost(document)).find(Boolean) ?? null
    );
  },

  getPost: async (slug: string): Promise<LegalPost | null> => {
    const documents = await fetchDocuments<PayloadLegalDocument>({
      collection: getLegalPagesCollection(),
      limit: 1,
      where: {
        slug,
      },
    });

    return (
      documents.map((document) => mapLegalPost(document)).find(Boolean) ?? null
    );
  },
};
