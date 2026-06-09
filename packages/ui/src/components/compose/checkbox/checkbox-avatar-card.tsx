"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui-shadcn/avatar";
import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxFrame, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxAvatarCard() {
  return (
    <CheckboxPatternCard
      description="Profile avatars make each selectable item easier to scan."
      title="Avatar based card checkbox"
    >
      <CheckboxFrame>
        <div className="grid gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
            <Avatar size="sm">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Label htmlFor="checkbox-avatar-1" className="font-medium">
                Amelia Morgan
              </Label>
              <p className="text-sm text-muted-foreground">Product design</p>
            </div>
            <Checkbox id="checkbox-avatar-1" defaultChecked />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
            <Avatar size="sm">
              <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Label htmlFor="checkbox-avatar-2" className="font-medium">
                Jordan Smith
              </Label>
              <p className="text-sm text-muted-foreground">Operations</p>
            </div>
            <Checkbox id="checkbox-avatar-2" />
          </div>
        </div>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
