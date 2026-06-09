"use client";

import { CreditCardIcon, LandmarkIcon, WalletIcon } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import {
  CheckboxFrame,
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxPaymentMethodCard() {
  return (
    <CheckboxPatternCard
      description="A card-based payment selector with branded labels."
      title="Payment method card checkbox"
    >
      <CheckboxFrame>
        <CheckboxList>
          <CheckboxOption
            description="Fast checkout with saved card details."
            id="checkbox-payment-card"
            leading={
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CreditCardIcon className="size-3.5" aria-hidden="true" />
              </span>
            }
            title="Credit card"
            trailing={<Badge variant="secondary">Recommended</Badge>}
          />
          <CheckboxOption
            description="Use your connected business account."
            id="checkbox-payment-bank"
            leading={
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <LandmarkIcon className="size-3.5" aria-hidden="true" />
              </span>
            }
            title="Bank transfer"
          />
          <CheckboxOption
            description="Pay with wallet balance or top up later."
            id="checkbox-payment-wallet"
            leading={
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <WalletIcon className="size-3.5" aria-hidden="true" />
              </span>
            }
            title="Wallet"
            trailing={<Badge variant="outline">Beta</Badge>}
          />
        </CheckboxList>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
