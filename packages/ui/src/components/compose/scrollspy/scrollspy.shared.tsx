"use client";

import * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import { Separator } from "../../ui-shadcn/separator";

type ScrollspyTarget = HTMLElement | Document | null | undefined;

type ScrollspyProps = React.PropsWithChildren<{
  targetRef?: React.RefObject<ScrollspyTarget>;
  onUpdate?: (id: string) => void;
  offset?: number;
  smooth?: boolean;
  history?: boolean;
  dataAttribute?: string;
  className?: string;
  navLabel?: string;
}>;

type ScrollspyPatternCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function ScrollspyPatternCard({
  title,
  description,
  children,
}: ScrollspyPatternCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function getTargetNode(target: ScrollspyTarget) {
  if (!target) {
    return document;
  }

  return target;
}

function isDocument(target: ScrollspyTarget): target is Document {
  return target === document;
}

function getScrollTop(target: ScrollspyTarget) {
  if (isDocument(target)) {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  return target?.scrollTop ?? 0;
}

function getViewportTop(target: ScrollspyTarget) {
  return getScrollTop(target);
}

function getViewportHeight(target: ScrollspyTarget) {
  if (isDocument(target)) {
    return window.innerHeight;
  }

  return target?.clientHeight ?? 0;
}

function getOffsetForAnchor(anchor: Element | null, fallback: number) {
  if (!anchor) {
    return fallback;
  }

  const raw = anchor.getAttribute("data-scrollspy-offset");
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getSectionElements(target: ScrollspyTarget, dataAttribute: string) {
  const root = getTargetNode(target);
  const selector = `[data-${dataAttribute}-anchor]`;
  return Array.from(root.querySelectorAll(selector));
}

function getAnchorElements(root: ParentNode, dataAttribute: string) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(`[data-${dataAttribute}-anchor]`),
  );
}

function getSectionById(target: ScrollspyTarget, id: string) {
  if (isDocument(target)) {
    return document.getElementById(id);
  }

  return target?.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ?? null;
}

function getAnchorById(root: ParentNode, dataAttribute: string, id: string) {
  return root.querySelector<HTMLElement>(
    `[data-${dataAttribute}-anchor="${CSS.escape(id)}"]`,
  );
}

function setActiveState(
  root: ParentNode,
  dataAttribute: string,
  activeId: string | null,
) {
  const anchors = getAnchorElements(root, dataAttribute);

  for (const anchor of anchors) {
    const anchorId = anchor.getAttribute(`data-${dataAttribute}-anchor`);
    const isActive = Boolean(activeId && anchorId === activeId);
    anchor.dataset.active = isActive ? "true" : "false";

    if (isActive) {
      anchor.setAttribute("aria-current", "location");
    } else if (anchor.getAttribute("aria-current") === "location") {
      anchor.removeAttribute("aria-current");
    }
  }
}

function updateHash(id: string, replace = true) {
  if (!id) {
    return;
  }

  const nextHash = `#${id}`;

  if (replace) {
    window.history.replaceState(null, "", nextHash);
    return;
  }

  window.history.pushState(null, "", nextHash);
}

function scrollToSection(
  target: ScrollspyTarget,
  section: HTMLElement,
  offset: number,
  smooth: boolean,
) {
  const root = getTargetNode(target);
  const behavior = smooth ? "smooth" : "auto";

  if (isDocument(root)) {
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior });
    return;
  }

  const top =
    section.getBoundingClientRect().top -
    root.getBoundingClientRect().top +
    root.scrollTop -
    offset;

  root.scrollTo({ top, behavior });
}

export function Scrollspy({
  targetRef,
  onUpdate,
  offset = 0,
  smooth = true,
  history = true,
  dataAttribute = "scrollspy",
  navLabel = "Scrollspy navigation",
  className,
  children,
}: ScrollspyProps) {
  const navRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const root = targetRef?.current ?? document;
    const navRoot = navRef.current;
    const anchors = navRoot ? getAnchorElements(navRoot, dataAttribute) : [];

    if (anchors.length === 0 || !navRoot) {
      return;
    }

    let raf = 0;
    let lastActiveId: string | null = null;

    const setActive = (nextId: string | null) => {
      if (!nextId || nextId === lastActiveId) {
        return;
      }

      lastActiveId = nextId;
      setActiveState(navRoot, dataAttribute, nextId);
      onUpdate?.(nextId);

      if (history) {
        updateHash(nextId);
      }
    };

    const computeActiveId = () => {
      const scrollTop = getViewportTop(root);
      const viewportHeight = getViewportHeight(root);
      const probeLine = scrollTop + Math.max(1, offset + 1);

      const sections = getSectionElements(root, dataAttribute)
        .map((section) => {
          const id =
            section.getAttribute(`data-${dataAttribute}-anchor`) ?? section.id;
          const anchor = getAnchorById(navRoot, dataAttribute, id);

          return {
            id,
            offset: getOffsetForAnchor(anchor ?? section, offset),
            top: isDocument(root)
              ? section.getBoundingClientRect().top + window.scrollY
              : section.getBoundingClientRect().top -
                root.getBoundingClientRect().top +
                root.scrollTop,
          };
        })
        .filter((section) => Boolean(section.id))
        .sort((a, b) => a.top - b.top);

      if (sections.length === 0) {
        return null;
      }

      const activeSection =
        sections
          .filter((section) => probeLine >= section.top - section.offset)
          .at(-1) ??
        sections.find(
          (section) =>
            probeLine < section.top - section.offset &&
            probeLine + viewportHeight >= section.top,
        ) ??
        sections[0];

      return activeSection?.id ?? null;
    };

    const updateActive = () => {
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const nextId = computeActiveId();
        if (nextId) {
          setActive(nextId);
        }
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLElement>(
        `[data-${dataAttribute}-anchor]`,
      );

      if (!anchor) {
        return;
      }

      const anchorId = anchor.getAttribute(`data-${dataAttribute}-anchor`);
      if (!anchorId) {
        return;
      }

      const section = getSectionById(root, anchorId);
      if (!section) {
        return;
      }

      event.preventDefault();
      const anchorOffset = getOffsetForAnchor(anchor, offset);
      scrollToSection(root, section, anchorOffset, smooth);
      setActive(anchorId);
    };

    const scrollTarget = isDocument(root) ? window : root;
    scrollTarget.addEventListener("scroll", updateActive, { passive: true });
    navRoot.addEventListener("click", onClick);
    window.addEventListener("resize", updateActive);

    updateActive();

    return () => {
      cancelAnimationFrame(raf);
      scrollTarget.removeEventListener("scroll", updateActive);
      navRoot.removeEventListener("click", onClick);
      window.removeEventListener("resize", updateActive);
    };
  }, [dataAttribute, history, offset, onUpdate, smooth, targetRef]);

  return (
    <nav
      ref={navRef}
      aria-label={navLabel}
      className={cn("flex flex-col gap-2", className)}
    >
      {children}
    </nav>
  );
}

export function ScrollspyLink({
  className,
  variant = "secondary",
  children,
  ...props
}: React.ComponentProps<"a"> & {
  variant?: React.ComponentProps<typeof Badge>["variant"];
  className?: string;
}) {
  const dataScrollspyAnchor = (props as Record<string, string | undefined>)[
    "data-scrollspy-anchor"
  ];

  return (
    <Badge variant={variant} asChild>
      <a
        data-slot="scrollspy-link"
        {...props}
        data-scrollspy-anchor={dataScrollspyAnchor}
        className={cn(
          "inline-flex w-full cursor-pointer items-center justify-start gap-2 rounded-md px-3 py-2 text-left text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground",
          className,
        )}
      >
        {children}
      </a>
    </Badge>
  );
}

export function ScrollspySection({
  className,
  title,
  description,
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
  id: string;
}) {
  return (
    <section
      id={id}
      data-scrollspy-anchor={id}
      className={cn(
        "rounded-2xl border bg-background p-6 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Badge variant="outline">Section</Badge>
      </div>
      <Separator className="my-4" />
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
