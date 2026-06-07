import type { ReactElement } from "react";
import { getTableOfContents } from "../lib/rich-text.ts";
import type { CmsRichText } from "../types.ts";

export type TableOfContentsProps = {
  className?: string;
  data?: CmsRichText | null;
};

export const TableOfContents = ({
  className,
  data,
}: TableOfContentsProps): ReactElement | null => {
  const items = getTableOfContents(data);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={className}>
      <ol className="flex list-none flex-col gap-2 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            {item.text}
          </li>
        ))}
      </ol>
    </nav>
  );
};
