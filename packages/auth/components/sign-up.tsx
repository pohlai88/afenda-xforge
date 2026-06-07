"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import { useState } from "react";
import { useAuthClient } from "../provider.tsx";
import { buildAuthCallbackPath } from "../routes.ts";

type FieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "type"
>;

export type SignUpProps = {
  readonly className?: string;
  readonly emailFieldProps?: FieldProps;
  readonly passwordFieldProps?: FieldProps;
  readonly redirectTo?: string;
  readonly signInHref?: string;
  readonly submitProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  readonly title?: ReactNode;
};

const getErrorMessage = (error: Error | { message?: string } | null): string =>
  typeof error?.message === "string" && error.message
    ? error.message
    : "Unable to sign up.";

const buildRedirectUrl = (redirectTo: string): string => {
  if (typeof window === "undefined") {
    return redirectTo;
  }

  return new URL(
    buildAuthCallbackPath(redirectTo),
    window.location.origin
  ).toString();
};

const signUp = async (
  client: SupabaseClient,
  email: string,
  password: string,
  redirectTo: string
): Promise<{ error: string | null; sessionCreated: boolean }> => {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildRedirectUrl(redirectTo),
    },
  });

  if (error) {
    return {
      error: error.message,
      sessionCreated: false,
    };
  }

  return {
    error: null,
    sessionCreated: Boolean(data.session),
  };
};

export const SignUp = ({
  className,
  emailFieldProps,
  passwordFieldProps,
  redirectTo = "/",
  signInHref = "/sign-in",
  submitProps,
  title = "Create account",
}: SignUpProps): ReactElement => {
  const client = useAuthClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const submitLabel = submitProps?.children ?? "Sign up";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setConfirmation(null);

    try {
      const result = await signUp(client, email, password, redirectTo);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.sessionCreated) {
        router.replace(redirectTo);
        return;
      }

      setConfirmation(
        "Check your email for a confirmation link to finish creating the account."
      );
    } catch (cause) {
      setError(getErrorMessage(cause instanceof Error ? cause : null));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">
          Create a Supabase account to get started.
        </p>
      </div>
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="font-medium text-sm">Email</span>
          <input
            {...emailFieldProps}
            autoComplete="email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block space-y-2">
          <span className="font-medium text-sm">Password</span>
          <input
            {...passwordFieldProps}
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
            required
            type="password"
            value={password}
          />
        </label>
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {confirmation ? (
        <p className="text-muted-foreground text-sm" role="status">
          {confirmation}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <a className="text-sm underline underline-offset-4" href={signInHref}>
          Already have an account
        </a>
        <button
          {...submitProps}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || submitProps?.disabled}
          type="submit"
        >
          {loading ? "Signing up..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
