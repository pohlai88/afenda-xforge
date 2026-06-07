import NextImage from "next/image";
import type { ReactElement } from "react";
import type { CmsImage } from "../types.ts";

export type ImageProps = CmsImage & {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export const Image = ({
  alt,
  blurDataURL,
  className,
  height,
  priority,
  sizes,
  url,
  width,
}: ImageProps): ReactElement => (
  <NextImage
    alt={alt ?? ""}
    blurDataURL={blurDataURL ?? undefined}
    className={className}
    height={height ?? 1200}
    placeholder={blurDataURL ? "blur" : "empty"}
    priority={priority}
    sizes={sizes}
    src={url}
    width={width ?? 1600}
  />
);
