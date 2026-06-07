import { lexicalEditor } from "@payloadcms/richtext-lexical";
import type { CollectionConfig, Field } from "payload";

const createImageFields = (): Field[] => [
  {
    name: "url",
    type: "text",
    required: true,
  },
  {
    name: "alt",
    type: "text",
  },
  {
    name: "width",
    type: "number",
  },
  {
    name: "height",
    type: "number",
  },
  {
    name: "blurDataURL",
    type: "text",
  },
];

const createImageGroupField = (name: string, label: string): Field => ({
  name,
  label,
  type: "group",
  fields: createImageFields(),
});

export const postsCollection: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "date",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "authors",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        createImageGroupField("avatar", "Avatar"),
        {
          name: "xUrl",
          type: "text",
        },
      ],
    },
    {
      name: "categories",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
      ],
    },
    createImageGroupField("image", "Image"),
    {
      name: "body",
      type: "richText",
      editor: lexicalEditor({}),
    },
  ],
};

export const legalPagesCollection: CollectionConfig = {
  slug: "legal-pages",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "body",
      type: "richText",
      editor: lexicalEditor({}),
    },
  ],
};

export const cmsCollections: CollectionConfig[] = [
  postsCollection,
  legalPagesCollection,
];
