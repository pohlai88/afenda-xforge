"use client";

import { Lock, QrCode, Sparkles, User } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import { Accordion, AccordionSection } from "./accordion.shared";

export function AccordionOnboardingSetupSteps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Accordion component for onboarding or setup steps with icons, badges,
          and QR codes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionSection
            title="Add products"
            badge={<Badge variant="secondary">Ready</Badge>}
            icon={<Sparkles className="size-4" />}
          >
            <div className="flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-xl border bg-muted/40">
                <QrCode className="size-6" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Get the point-of-sale application installed and ready on the
                  device you will use at the counter.
                </p>
                <p className="text-sm">
                  Scan the QR code or send yourself the link to continue the
                  setup flow.
                </p>
              </div>
            </div>
          </AccordionSection>
          <AccordionSection
            title="Account connection"
            icon={<User className="size-4" />}
            badge={<Badge variant="outline">Step 2</Badge>}
          >
            Link the account, confirm the workspace, and verify the owner
            profile before inviting the rest of the team.
          </AccordionSection>
          <AccordionSection
            title="Security checks"
            icon={<Lock className="size-4" />}
            badge={<Badge>Required</Badge>}
          >
            Review password policy, two-factor authentication, and trusted
            device settings before going live.
          </AccordionSection>
        </Accordion>
      </CardContent>
    </Card>
  );
}
