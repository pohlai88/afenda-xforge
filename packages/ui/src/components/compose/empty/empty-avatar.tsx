"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "../../ui-shadcn/avatar";
import { Button } from "../../ui-shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../../ui-shadcn/empty";
import { ComposePatternCard } from "../compose.pattern-shell";

export function EmptyAvatar() {
  return (
    <ComposePatternCard
      title="Avatar"
      description="An empty state that anchors the message with collaborator identity."
    >
      <Empty className="rounded-lg border bg-background">
        <EmptyHeader>
          <AvatarGroup>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/80?img=11" alt="Ava" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/80?img=14" alt="Noah" />
              <AvatarFallback>NC</AvatarFallback>
            </Avatar>
          </AvatarGroup>
          <EmptyTitle>No reviewers assigned</EmptyTitle>
          <EmptyDescription>
            Add collaborators to turn draft metadata into a reviewable flow.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Invite reviewers</Button>
        </EmptyContent>
      </Empty>
    </ComposePatternCard>
  );
}
