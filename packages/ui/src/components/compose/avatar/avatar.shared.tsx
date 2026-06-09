"use client";

import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Sparkles,
  User2,
  Users2,
} from "lucide-react";
import type * as React from "react";
import { cn } from "../../../lib/utils";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "../../ui-shadcn/avatar";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui-shadcn/dropdown-menu";
import { Skeleton } from "../../ui-shadcn/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui-shadcn/tooltip";

export type AvatarPerson = {
  name: string;
  initials: string;
  role: string;
  image: string;
};

export const avatarPeople: readonly AvatarPerson[] = [
  {
    name: "Ava Johnson",
    initials: "AJ",
    role: "Admin",
    image: "https://i.pravatar.cc/160?img=47",
  },
  {
    name: "Noah Chen",
    initials: "NC",
    role: "Designer",
    image: "https://i.pravatar.cc/160?img=12",
  },
  {
    name: "Mia Torres",
    initials: "MT",
    role: "Engineer",
    image: "https://i.pravatar.cc/160?img=32",
  },
  {
    name: "Liam Patel",
    initials: "LP",
    role: "Support",
    image: "https://i.pravatar.cc/160?img=22",
  },
  {
    name: "Sophia Reed",
    initials: "SR",
    role: "Marketing",
    image: "https://i.pravatar.cc/160?img=5",
  },
  {
    name: "Ethan Brooks",
    initials: "EB",
    role: "Founder",
    image: "https://i.pravatar.cc/160?img=18",
  },
  {
    name: "Olivia Park",
    initials: "OP",
    role: "Operations",
    image: "https://i.pravatar.cc/160?img=39",
  },
  {
    name: "Lucas Kim",
    initials: "LK",
    role: "Product",
    image: "https://i.pravatar.cc/160?img=56",
  },
] as const;

export function AvatarPatternCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AvatarStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] items-center justify-center rounded-lg bg-muted/40 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DemoAvatar({
  person = avatarPeople[0],
  size = "default",
  className,
  imageClassName,
  fallbackClassName,
  showImage = true,
  children,
}: {
  person?: AvatarPerson;
  size?: "default" | "sm" | "lg";
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  showImage?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Avatar size={size} className={className}>
      {showImage ? (
        <AvatarImage
          src={person.image}
          alt={person.name}
          className={imageClassName}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {person.initials}
      </AvatarFallback>
      {children}
    </Avatar>
  );
}

export function AvatarPresenceDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute size-2 rounded-full border-2 border-background bg-success",
        className,
      )}
    />
  );
}

export function AvatarLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-[11px]", className)}
    >
      {children}
    </Badge>
  );
}

export function AvatarStack({
  people = avatarPeople.slice(0, 4),
  count,
  size = "default",
  className,
  avatarClassName,
  fallbackClassName,
  countLabel,
  countIcon,
}: {
  people?: readonly AvatarPerson[];
  count?: number;
  size?: "default" | "sm" | "lg";
  className?: string;
  avatarClassName?: string;
  fallbackClassName?: string;
  countLabel?: string;
  countIcon?: React.ReactNode;
}) {
  return (
    <AvatarGroup className={className}>
      {people.map((person) => (
        <DemoAvatar
          key={person.name}
          person={person}
          size={size}
          className={avatarClassName}
          fallbackClassName={fallbackClassName}
        />
      ))}
      {typeof count === "number" ? (
        <AvatarGroupCount>
          {countIcon ?? null}
          {countLabel ?? `+${count}`}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}

export function AvatarPersonRow({
  person,
  badge,
  description,
  className,
}: {
  person: AvatarPerson;
  badge?: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background p-3",
        className,
      )}
    >
      <DemoAvatar person={person} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{person.name}</p>
          {badge}
        </div>
        <p className="text-xs text-muted-foreground">
          {description ?? person.role}
        </p>
      </div>
    </div>
  );
}

export function AvatarActionButton({
  children,
  className,
  variant = "outline",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("h-9 rounded-full px-3", className)}
    >
      {children}
    </Button>
  );
}

export type AvatarPatternName =
  | "basic"
  | "fallback"
  | "different-sizes"
  | "different-border-radiuses"
  | "custom-sizes"
  | "online-status-badge"
  | "badge-icon"
  | "different-badge-positions"
  | "different-badge-positions-2"
  | "basic-group"
  | "numerical-count"
  | "icon-count"
  | "distinct-border-ring"
  | "light-background-fallback"
  | "solid-background-fallback"
  | "user-details-and-badge"
  | "grayscale-image-filter"
  | "group-online-status-on-one"
  | "inside-small-outline-button"
  | "social-proof-text-label"
  | "compact-social-proof-initials"
  | "hover-tooltips-lift-effect"
  | "hover-effect"
  | "hover-effect-tooltips"
  | "numerical-count-2"
  | "pilled-small-outline-button"
  | "pilled-small-button"
  | "empty-state-example"
  | "icon-count-and-button"
  | "loading-state"
  | "custom-badge"
  | "ring-animation"
  | "gradient-animated-ring"
  | "multiple-badges"
  | "compact-dropdown-menu";

function avatarTitle(name: AvatarPatternName) {
  switch (name) {
    case "basic":
      return "Basic avatar";
    case "fallback":
      return "Avatar with fallback";
    case "different-sizes":
      return "Avatars with different sizes";
    case "different-border-radiuses":
      return "Avatars with different border radiuses";
    case "custom-sizes":
      return "Avatars with custom sizes";
    case "online-status-badge":
      return "Avatar with an online status badge";
    case "badge-icon":
      return "Avatar with badge icon";
    case "different-badge-positions":
      return "Avatar with different badge positions";
    case "different-badge-positions-2":
      return "Avatar with different badge positions";
    case "basic-group":
      return "Basic avatar group";
    case "numerical-count":
      return "Avatar group with numerical count";
    case "icon-count":
      return "Avatar group with an icon count";
    case "distinct-border-ring":
      return "Avatar with a distinct border ring";
    case "light-background-fallback":
      return "Avatar with light background color fallback";
    case "solid-background-fallback":
      return "Avatar with a solid background color fallback";
    case "user-details-and-badge":
      return "Avatar with user details and badge";
    case "grayscale-image-filter":
      return "Avatar with grayscale image filter";
    case "group-online-status-on-one":
      return "Avatar group with online status on one";
    case "inside-small-outline-button":
      return "Avatar inside small outline button";
    case "social-proof-text-label":
      return "Avatar social proof with text label";
    case "compact-social-proof-initials":
      return "Compact social proof with initials";
    case "hover-tooltips-lift-effect":
      return "Avatar group with hover tooltips and lift effect";
    case "hover-effect":
      return "Avatar group with hover effect";
    case "hover-effect-tooltips":
      return "Avatar group with hover effect and tooltips";
    case "numerical-count-2":
      return "Avatar group with numerical count";
    case "pilled-small-outline-button":
      return "Pilled small outline button with avatar";
    case "pilled-small-button":
      return "Pilled small button with avatar";
    case "empty-state-example":
      return "Avatar inside an empty state example";
    case "icon-count-and-button":
      return "Avatar group with icon count and button";
    case "loading-state":
      return "Avatar with loading state demonstration";
    case "custom-badge":
      return "Avatar with custom badge";
    case "ring-animation":
      return "Avatar with ring animation";
    case "gradient-animated-ring":
      return "Avatar with gradient animated ring";
    case "multiple-badges":
      return "Avatar with multiple badges";
    case "compact-dropdown-menu":
      return "Compact avatar dropdown menu";
    default:
      return name;
  }
}

function avatarPeopleSlice(count: number) {
  return avatarPeople.slice(0, count);
}

function avatarWrapped(title: AvatarPatternName, children: React.ReactNode) {
  return (
    <AvatarPatternCard title={avatarTitle(title)}>{children}</AvatarPatternCard>
  );
}

export function renderAvatarPattern(name: AvatarPatternName) {
  switch (name) {
    case "basic":
      return avatarWrapped(
        "basic",
        <AvatarStage>
          <DemoAvatar person={avatarPeople[0]} size="lg" />
        </AvatarStage>,
      );
    case "fallback":
      return avatarWrapped(
        "fallback",
        <AvatarStage>
          <DemoAvatar
            person={avatarPeople[1]}
            size="lg"
            showImage={false}
            fallbackClassName="bg-muted text-base"
            className="size-16"
          />
        </AvatarStage>,
      );
    case "different-sizes":
      return avatarWrapped(
        "different-sizes",
        <AvatarStage>
          <div className="flex items-end gap-4">
            <DemoAvatar person={avatarPeople[0]} size="sm" />
            <DemoAvatar person={avatarPeople[1]} />
            <DemoAvatar person={avatarPeople[2]} size="lg" />
          </div>
        </AvatarStage>,
      );
    case "different-border-radiuses":
      return avatarWrapped(
        "different-border-radiuses",
        <AvatarStage>
          <div className="flex items-end gap-4">
            <DemoAvatar person={avatarPeople[0]} className="rounded-md" />
            <DemoAvatar person={avatarPeople[1]} className="rounded-xl" />
            <DemoAvatar person={avatarPeople[2]} className="rounded-3xl" />
          </div>
        </AvatarStage>,
      );
    case "custom-sizes":
      return avatarWrapped(
        "custom-sizes",
        <AvatarStage>
          <div className="flex items-end gap-4">
            <DemoAvatar person={avatarPeople[0]} className="size-11" />
            <DemoAvatar person={avatarPeople[1]} className="size-14" />
            <DemoAvatar person={avatarPeople[2]} className="size-20" />
            <DemoAvatar person={avatarPeople[3]} className="size-24" />
          </div>
        </AvatarStage>,
      );
    case "online-status-badge":
      return avatarWrapped(
        "online-status-badge",
        <AvatarStage>
          <DemoAvatar person={avatarPeople[0]} size="lg">
            <AvatarBadge className="bg-success text-success-foreground">
              <span className="size-1.5 rounded-full bg-current" />
            </AvatarBadge>
          </DemoAvatar>
        </AvatarStage>,
      );
    case "badge-icon":
      return avatarWrapped(
        "badge-icon",
        <AvatarStage>
          <DemoAvatar person={avatarPeople[1]} size="lg">
            <AvatarBadge className="bg-primary text-primary-foreground">
              <Check className="size-2" />
            </AvatarBadge>
          </DemoAvatar>
        </AvatarStage>,
      );
    case "different-badge-positions":
      return avatarWrapped(
        "different-badge-positions",
        <AvatarStage>
          <div className="relative">
            <DemoAvatar person={avatarPeople[2]} size="lg" />
            <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-background bg-primary" />
          </div>
        </AvatarStage>,
      );
    case "different-badge-positions-2":
      return avatarWrapped(
        "different-badge-positions-2",
        <AvatarStage>
          <div className="relative">
            <DemoAvatar person={avatarPeople[3]} size="lg" />
            <span className="absolute -bottom-1 -left-1 size-3 rounded-full border-2 border-background bg-success" />
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-[10px] text-white">
              2
            </span>
          </div>
        </AvatarStage>,
      );
    case "basic-group":
      return avatarWrapped(
        "basic-group",
        <AvatarStage>
          <AvatarStack people={avatarPeopleSlice(4)} size="default" />
        </AvatarStage>,
      );
    case "numerical-count":
      return avatarWrapped(
        "numerical-count",
        <AvatarStage>
          <AvatarStack people={avatarPeopleSlice(4)} count={7} />
        </AvatarStage>,
      );
    case "icon-count":
      return avatarWrapped(
        "icon-count",
        <AvatarStage>
          <AvatarStack
            people={avatarPeopleSlice(3)}
            count={7}
            countLabel="+7"
            countIcon={<Users2 className="size-3" />}
          />
        </AvatarStage>,
      );
    case "distinct-border-ring":
      return avatarWrapped(
        "distinct-border-ring",
        <AvatarStage>
          <DemoAvatar
            person={avatarPeople[4]}
            size="lg"
            className="ring-4 ring-primary/20 ring-offset-2 ring-offset-background"
          />
        </AvatarStage>,
      );
    case "light-background-fallback":
      return avatarWrapped(
        "light-background-fallback",
        <AvatarStage>
          <div className="flex items-end gap-4">
            <DemoAvatar
              person={avatarPeople[0]}
              showImage={false}
              className="bg-sky-100 text-sky-700"
            />
            <DemoAvatar
              person={avatarPeople[1]}
              showImage={false}
              className="bg-emerald-100 text-emerald-700"
            />
            <DemoAvatar
              person={avatarPeople[2]}
              showImage={false}
              className="bg-amber-100 text-amber-700"
            />
          </div>
        </AvatarStage>,
      );
    case "solid-background-fallback":
      return avatarWrapped(
        "solid-background-fallback",
        <AvatarStage>
          <div className="flex items-end gap-4">
            <DemoAvatar
              person={avatarPeople[3]}
              showImage={false}
              className="bg-slate-900 text-white"
            />
            <DemoAvatar
              person={avatarPeople[4]}
              showImage={false}
              className="bg-primary text-primary-foreground"
            />
            <DemoAvatar
              person={avatarPeople[5]}
              showImage={false}
              className="bg-destructive text-white"
            />
          </div>
        </AvatarStage>,
      );
    case "user-details-and-badge":
      return avatarWrapped(
        "user-details-and-badge",
        <div className="grid gap-3">
          {avatarPeopleSlice(3).map((person) => (
            <AvatarPersonRow
              key={person.name}
              person={person}
              badge={<AvatarLabel>{person.role}</AvatarLabel>}
            />
          ))}
        </div>,
      );
    case "grayscale-image-filter":
      return avatarWrapped(
        "grayscale-image-filter",
        <AvatarStage>
          <div className="flex items-end gap-4">
            <DemoAvatar
              person={avatarPeople[0]}
              size="lg"
              imageClassName="grayscale transition duration-300 group-hover/avatar:grayscale-0"
            />
            <DemoAvatar
              person={avatarPeople[1]}
              size="lg"
              imageClassName="grayscale"
            />
          </div>
        </AvatarStage>,
      );
    case "group-online-status-on-one":
      return avatarWrapped(
        "group-online-status-on-one",
        <AvatarStage>
          <AvatarGroup className="items-center">
            <DemoAvatar person={avatarPeople[0]} size="default">
              <AvatarBadge className="bg-success text-success-foreground">
                <span className="size-1.5 rounded-full bg-current" />
              </AvatarBadge>
            </DemoAvatar>
            <DemoAvatar person={avatarPeople[1]} />
            <DemoAvatar person={avatarPeople[2]} />
            <DemoAvatar person={avatarPeople[3]} />
          </AvatarGroup>
        </AvatarStage>,
      );
    case "inside-small-outline-button":
      return avatarWrapped(
        "inside-small-outline-button",
        <AvatarStage>
          <AvatarActionButton>
            <DemoAvatar person={avatarPeople[0]} size="sm" className="size-5" />
            View profile
          </AvatarActionButton>
        </AvatarStage>,
      );
    case "social-proof-text-label":
      return avatarWrapped(
        "social-proof-text-label",
        <AvatarStage>
          <div className="flex items-center gap-3">
            <AvatarStack people={avatarPeopleSlice(4)} />
            <div className="text-sm">
              <div className="font-medium">Trusted by 100K+ users.</div>
              <div className="text-muted-foreground">
                Teams use avatars to build confidence.
              </div>
            </div>
          </div>
        </AvatarStage>,
      );
    case "compact-social-proof-initials":
      return avatarWrapped(
        "compact-social-proof-initials",
        <AvatarStage>
          <div className="flex items-center gap-2">
            <AvatarStack
              people={avatarPeopleSlice(3)}
              size="sm"
              className="-space-x-1"
              avatarClassName="ring-background"
            />
            <span className="text-sm text-muted-foreground">
              Trusted by product teams
            </span>
          </div>
        </AvatarStage>,
      );
    case "hover-tooltips-lift-effect":
      return avatarWrapped(
        "hover-tooltips-lift-effect",
        <AvatarStage>
          <TooltipProvider>
            <AvatarGroup className="-space-x-2">
              {avatarPeopleSlice(4).map((person) => (
                <Tooltip key={person.name}>
                  <TooltipTrigger asChild>
                    <DemoAvatar
                      person={person}
                      className="transition duration-200 hover:-translate-y-1 hover:scale-105"
                    />
                  </TooltipTrigger>
                  <TooltipContent>{person.name}</TooltipContent>
                </Tooltip>
              ))}
            </AvatarGroup>
          </TooltipProvider>
        </AvatarStage>,
      );
    case "hover-effect":
      return avatarWrapped(
        "hover-effect",
        <AvatarStage>
          <div className="flex items-center gap-4">
            {avatarPeopleSlice(4).map((person) => (
              <DemoAvatar
                key={person.name}
                person={person}
                className="transition duration-200 hover:-translate-y-1 hover:scale-105"
              />
            ))}
          </div>
        </AvatarStage>,
      );
    case "hover-effect-tooltips":
      return avatarWrapped(
        "hover-effect-tooltips",
        <AvatarStage>
          <TooltipProvider>
            <div className="flex items-center gap-4">
              {avatarPeopleSlice(4).map((person) => (
                <Tooltip key={person.name}>
                  <TooltipTrigger asChild>
                    <DemoAvatar
                      person={person}
                      className="transition duration-200 hover:shadow-lg hover:shadow-primary/10"
                    />
                  </TooltipTrigger>
                  <TooltipContent>{person.role}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </AvatarStage>,
      );
    case "numerical-count-2":
      return avatarWrapped(
        "numerical-count-2",
        <AvatarStage>
          <div className="flex items-center gap-3">
            <AvatarStack people={avatarPeopleSlice(3)} count={12} />
            <Badge variant="outline" className="rounded-full">
              +12 active
            </Badge>
          </div>
        </AvatarStage>,
      );
    case "pilled-small-outline-button":
      return avatarWrapped(
        "pilled-small-outline-button",
        <AvatarStage>
          <AvatarActionButton className="gap-2">
            <DemoAvatar person={avatarPeople[2]} size="sm" className="size-5" />
            Open profile
          </AvatarActionButton>
        </AvatarStage>,
      );
    case "pilled-small-button":
      return avatarWrapped(
        "pilled-small-button",
        <AvatarStage>
          <AvatarActionButton variant="default" className="gap-2">
            <DemoAvatar person={avatarPeople[3]} size="sm" className="size-5" />
            Invite
          </AvatarActionButton>
        </AvatarStage>,
      );
    case "empty-state-example":
      return avatarWrapped(
        "empty-state-example",
        <AvatarStage className="py-10">
          <div className="flex max-w-sm flex-col items-center text-center">
            <DemoAvatar person={avatarPeople[5]} size="lg" className="mb-4" />
            <h3 className="text-base font-medium">No teammates yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Invite people to see avatars, roles, and live presence in one
              place.
            </p>
            <Button className="mt-4 rounded-full">Invite teammates</Button>
          </div>
        </AvatarStage>,
      );
    case "icon-count-and-button":
      return avatarWrapped(
        "icon-count-and-button",
        <AvatarStage>
          <div className="flex items-center gap-3">
            <AvatarStack
              people={avatarPeopleSlice(4)}
              count={7}
              countIcon={<User2 className="size-3" />}
            />
            <AvatarActionButton variant="outline">
              Add people
              <ArrowRight className="size-3.5" />
            </AvatarActionButton>
          </div>
        </AvatarStage>,
      );
    case "loading-state":
      return avatarWrapped(
        "loading-state",
        <AvatarStage>
          <div className="flex w-full max-w-sm items-center gap-3 rounded-lg border bg-background p-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </div>
        </AvatarStage>,
      );
    case "custom-badge":
      return avatarWrapped(
        "custom-badge",
        <AvatarStage>
          <div className="relative">
            <DemoAvatar person={avatarPeople[6]} size="lg" />
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px]">
              Active now
            </Badge>
          </div>
        </AvatarStage>,
      );
    case "ring-animation":
      return avatarWrapped(
        "ring-animation",
        <AvatarStage>
          <div className="relative">
            <div className="absolute inset-0 rounded-full ring-8 ring-primary/20 animate-pulse" />
            <DemoAvatar
              person={avatarPeople[7]}
              size="lg"
              className="relative"
            />
          </div>
        </AvatarStage>,
      );
    case "gradient-animated-ring":
      return avatarWrapped(
        "gradient-animated-ring",
        <AvatarStage>
          <div className="relative rounded-full p-1">
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary)),transparent_35%,hsl(var(--primary)/0.15),transparent_70%,hsl(var(--primary)))] opacity-80 blur-[1px]" />
            <DemoAvatar
              person={avatarPeople[0]}
              size="lg"
              className="relative"
            />
          </div>
        </AvatarStage>,
      );
    case "multiple-badges":
      return avatarWrapped(
        "multiple-badges",
        <AvatarStage>
          <div className="relative">
            <DemoAvatar person={avatarPeople[1]} size="lg" />
            <span className="absolute -top-1 -left-1 rounded-full bg-success px-2 py-0.5 text-[10px] text-success-foreground">
              Live
            </span>
            <span className="absolute -bottom-1 -right-1 rounded-full bg-warning px-2 py-0.5 text-[10px] text-warning-foreground">
              VIP
            </span>
          </div>
        </AvatarStage>,
      );
    case "compact-dropdown-menu":
      return avatarWrapped(
        "compact-dropdown-menu",
        <AvatarStage>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-2 rounded-full border bg-background px-2 py-1 pr-3 shadow-xs transition hover:bg-muted"
              >
                <DemoAvatar
                  person={avatarPeople[2]}
                  size="sm"
                  className="size-7"
                />
                <span className="text-sm font-medium">
                  {avatarPeople[2].name}
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{avatarPeople[2].name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User2 className="size-4" />
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="size-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Sparkles className="size-4" />
                Upgrade plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </AvatarStage>,
      );
    default:
      return null;
  }
}
