export type MetadataCustomizationScope = "company" | "tenant";

export type MetadataFieldHiddenCustomizationPolicy = "allow" | "allow-required";

export type MetadataFieldCustomizationPolicy = {
  description?: boolean;
  hidden?: MetadataFieldHiddenCustomizationPolicy;
  label?: boolean;
  order?: boolean;
  placeholder?: boolean;
  systemOwned?: boolean;
};

export type MetadataSectionCustomizationPolicy = {
  columns?: boolean;
  description?: boolean;
  fieldKeys?: boolean;
  hidden?: boolean;
  label?: boolean;
};

export type MetadataFormCustomizationPolicy = {
  hidden?: boolean;
  label?: boolean;
  layout?: boolean;
  sectionKeys?: boolean;
};

export type MetadataTableColumnCustomizationPolicy = {
  align?: boolean;
  field?: boolean;
  hidden?: boolean;
  label?: boolean;
  order?: boolean;
  width?: boolean;
};

export type MetadataTableCustomizationPolicy = {
  columns?: boolean;
  hidden?: boolean;
  title?: boolean;
};

export type MetadataEntityTableCustomizationPolicy = {
  columns?: boolean;
  defaultSort?: boolean;
  title?: boolean;
};

export type MetadataFilterCustomizationPolicy = {
  hidden?: boolean;
  label?: boolean;
};

export type MetadataActionCustomizationPolicy = {
  hidden?: boolean;
  label?: boolean;
  placement?: boolean;
  safe?: boolean;
};

export type MetadataPresentationCustomizationPolicy = {
  density?: boolean;
  icon?: boolean;
  size?: boolean;
  tone?: boolean;
  variant?: boolean;
};

export type MetadataFeatureCustomizationPolicy = {
  presentation?: MetadataPresentationCustomizationPolicy;
  scopes?: readonly MetadataCustomizationScope[];
};
