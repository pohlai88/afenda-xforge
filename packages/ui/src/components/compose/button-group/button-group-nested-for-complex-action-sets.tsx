// Description: Nested button groups for complex action sets
// Order: 9

import { Button } from "../../ui-shadcn/button";
import { ButtonGroup } from "../../ui-shadcn/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui-shadcn/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui-shadcn/tooltip";
import { IconPlaceholder } from "./icon-placeholder";

export function ButtonGroupNestedForComplexActionSets() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Send message">
          <IconPlaceholder
            lucide="SendIcon"
            tabler="IconSend"
            hugeicons="SentIcon"
            phosphor="PaperPlaneTiltIcon"
            remixicon="RiSendInsLine"
            aria-hidden="true"
          />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <InputGroup>
          <InputGroupInput placeholder="Send a message..." />
          <Tooltip>
            <TooltipTrigger render={<InputGroupAddon align="inline-end" />}>
              <IconPlaceholder
                lucide="AudioLinesIcon"
                tabler="IconBrandGooglePodcasts"
                hugeicons="AudioWave01Icon"
                phosphor="WaveformIcon"
                remixicon="RiVoiceprintLine"
                aria-hidden="true"
              />
            </TooltipTrigger>
            <TooltipContent>Voice Mode</TooltipContent>
          </Tooltip>
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  );
}
