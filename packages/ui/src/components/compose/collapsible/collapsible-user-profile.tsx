"use client";

import {
  BadgeCheck,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui-shadcn/avatar";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { Separator } from "../../ui-shadcn/separator";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

export function CollapsibleUserProfile() {
  return (
    <CollapsiblePatternCard
      title="Collapsible user profile"
      description="A compact profile summary that expands into contact and biography details."
    >
      <CollapsibleStage>
        <CollapsibleRoot
          defaultOpen
          className="w-full max-w-md rounded-2xl border bg-background shadow-sm"
        >
          <div className="flex items-center gap-4 px-4 py-4">
            <Avatar size="lg" className="ring-2 ring-background">
              <AvatarImage
                src="https://i.pravatar.cc/160?img=47"
                alt="Ava Johnson"
              />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">Ava Johnson</p>
                <Badge variant="secondary" className="rounded-full">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Product lead</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="group">
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4 px-4 pb-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Leads cross-functional launches and keeps the team aligned on
              scope, review gates, and release timing.
            </p>
            <Separator />
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span>ava@company.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span>+66 91 000 1122</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span>Bangkok, Thailand</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm">
                <UserRound className="size-4" />
                Open profile
              </Button>
              <Button variant="ghost" size="sm">
                Message
              </Button>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
