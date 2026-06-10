"use client";

type LamRowToggleFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  active: boolean;
  disabled?: boolean;
  id: string;
};

export const LamRowToggleForm = ({
  action,
  active,
  disabled = false,
  id,
}: LamRowToggleFormProps) => (
  <form action={action} className="inline">
    <input name="id" type="hidden" value={id} />
    <input name="active" type="hidden" value={active ? "false" : "true"} />
    <button
      aria-label={active ? "Deactivate record" : "Activate record"}
      className="rounded-md border border-border px-2 py-1 text-xs transition hover:bg-muted disabled:opacity-50"
      disabled={disabled}
      title={
        active
          ? "Soft deactivate (sets active to false; record is retained)"
          : "Reactivate record"
      }
      type="submit"
    >
      {active ? "Deactivate" : "Activate"}
    </button>
  </form>
);
