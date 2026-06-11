import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";

type StorybookLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export default function Link({
  href,
  children,
  ...props
}: StorybookLinkProps): ReactElement {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
