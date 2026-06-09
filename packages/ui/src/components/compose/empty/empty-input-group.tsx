"use client";

import { ArrowRight, Mail } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../ui-shadcn/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../ui-shadcn/input-group";
import { ComposePatternCard } from "../compose.pattern-shell";

export function EmptyInputGroup() {
  return (
    <ComposePatternCard
      title="Input Group"
      description="An empty state that captures the next input inline."
    >
      <Empty className="rounded-lg border bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Mail className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No notification channels configured</EmptyTitle>
          <EmptyDescription>
            Add a recipient to begin routing metadata change notifications.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <InputGroup className="max-w-sm">
            <InputGroupInput placeholder="team@example.com" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-sm" aria-label="Add recipient">
                <ArrowRight className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button variant="outline">Configure later</Button>
        </EmptyContent>
      </Empty>
    </ComposePatternCard>
  );
}
