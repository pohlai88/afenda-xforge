"use client";

import { ChevronDown, Mail } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { Separator } from "../../ui-shadcn/separator";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

export function CollapsibleCardWithBottomTrigger() {
  return (
    <CollapsiblePatternCard
      title="Collapsible card with bottom trigger"
      description="The trigger sits in the footer so the summary stays anchored at the bottom."
    >
      <CollapsibleStage>
        <CollapsibleRoot defaultOpen className="w-full max-w-md">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>Weekly digest</CardTitle>
                  <CardDescription>
                    A quick snapshot of the messages queued for review.
                  </CardDescription>
                </div>
                <Badge variant="outline">12 unread</Badge>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Finance request</p>
                    <p className="text-sm text-muted-foreground">
                      Approval needed before 4:00 PM
                    </p>
                  </div>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  The trigger remains in the footer, so the user can expand the
                  card after scanning the top summary.
                </p>
              </CardContent>
            </CollapsibleContent>
            <CardFooter className="border-t pt-4">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="group w-full justify-between"
                >
                  <span>Hide details</span>
                  <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
            </CardFooter>
          </Card>
        </CollapsibleRoot>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
