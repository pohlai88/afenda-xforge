import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox, NativeSelect, NativeSelectOption, Switch } from "@repo/ui";
import { Textarea } from "@repo/ui/components/textarea";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

export type PrimitiveButtonShowcaseProps = {
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
};

export function PrimitiveButtonShowcase({
  disabled = false,
  label = "Save",
  onClick,
  variant = "default",
}: PrimitiveButtonShowcaseProps) {
  return (
    <Button disabled={disabled} onClick={onClick} type="button" variant={variant}>
      {label}
    </Button>
  );
}

export type PrimitiveButtonsMatrixProps = {
  showLink?: boolean;
};

export function PrimitiveButtonsMatrix({
  showLink = true,
}: PrimitiveButtonsMatrixProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      {showLink ? <Button variant="link">Link</Button> : null}
    </div>
  );
}

export function PrimitiveBadgesMatrix() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  );
}

export type PrimitiveInputShowcaseProps = {
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  value?: string;
};

export function PrimitiveInputShowcase({
  disabled = false,
  label = "Name",
  placeholder = "Acme Billing",
  value = "",
}: PrimitiveInputShowcaseProps) {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="primitive-input-showcase">{label}</Label>
      <Input
        disabled={disabled}
        id="primitive-input-showcase"
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}

export type PrimitiveTextareaShowcaseProps = {
  disabled?: boolean;
  label?: string;
  placeholder?: string;
};

export function PrimitiveTextareaShowcase({
  disabled = false,
  label = "Notes",
  placeholder = "Internal notes",
}: PrimitiveTextareaShowcaseProps) {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="primitive-textarea-showcase">{label}</Label>
      <Textarea
        disabled={disabled}
        id="primitive-textarea-showcase"
        placeholder={placeholder}
      />
    </div>
  );
}

export type PrimitiveSelectionShowcaseProps = {
  checkboxLabel?: string;
  statusDefault?: string;
  switchLabel?: string;
};

export function PrimitiveSelectionShowcase({
  checkboxLabel = "Enable notifications",
  statusDefault = "active",
  switchLabel = "Autopay enabled",
}: PrimitiveSelectionShowcaseProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="primitive-checkbox-showcase" />
        <Label htmlFor="primitive-checkbox-showcase">{checkboxLabel}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="primitive-switch-showcase" />
        <Label htmlFor="primitive-switch-showcase">{switchLabel}</Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="primitive-status-showcase">Status</Label>
        <NativeSelect defaultValue={statusDefault} id="primitive-status-showcase">
          <NativeSelectOption value="draft">Draft</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="archived">Archived</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
}
