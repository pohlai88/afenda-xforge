// Description: Button loading states
// Order: 6

import { Button } from "../../ui-shadcn/button";
import { Spinner } from "../../ui-shadcn/spinner";

export function SpinnerButtonLoadingStates() {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button disabled>
        <Spinner />
        Saving...
      </Button>
      <Button variant="outline" disabled>
        <Spinner />
        Loading
      </Button>
      <Button variant="secondary" disabled>
        <Spinner />
        Processing
      </Button>
    </div>
  );
}
