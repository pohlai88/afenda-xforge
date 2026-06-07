import { RichText } from "@payloadcms/richtext-lexical/react";
import type { ReactElement } from "react";
import { resolveRichTextData } from "../lib/rich-text.js";
import type { CmsRichText } from "../types.js";

export type BodyProps = {
  className?: string;
  data?: CmsRichText | null;
};

export const Body = ({ className, data }: BodyProps): ReactElement | null => {
  const lexical = resolveRichTextData(data);

  if (!lexical) {
    return null;
  }

  return (
    <div className={className}>
      <RichText data={lexical} />
    </div>
  );
};
