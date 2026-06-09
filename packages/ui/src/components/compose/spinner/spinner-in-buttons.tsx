// Description: Spinners in buttons.
// Order: 2

import { Button } from "../../ui-shadcn/button";
import { Spinner } from "../../ui-shadcn/spinner";

export function SpinnerInButtons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button>
        <Spinner data-icon="inline-start" /> Processing…
      </Button>
      <Button variant="outline" disabled>
        <Spinner data-icon="inline-start" /> Loading…
      </Button>
      <Button variant="outline" size="icon" disabled aria-label="Loading">
        <Spinner />
      </Button>
    </div>
  );
}
