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
import { useMemo, useState } from "react";
import { useAuthClient } from "../provider.tsx";

type FieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "type"
>;

export type SignInProps = {
  readonly className?: string;
  readonly emailFieldProps?: FieldProps;
  readonly passwordFieldProps?: FieldProps;
  readonly redirectTo?: string;
  readonly signUpHref?: string;
  readonly submitProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  readonly title?: ReactNode;
};

const getErrorMessage = (error: Error | { message?: string } | null): string =>
  typeof error?.message === "string" && error.message
    ? error.message
    : "Unable to sign in.";

const signIn = async (
  client: SupabaseClient,
  email: string,
  password: string
): Promise<string | null> => {
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return error.message;
  }
  return null;
};

export const SignIn = ({
  className,
  emailFieldProps,
  passwordFieldProps,
  redirectTo = "/",
  signUpHref = "/sign-up",
  submitProps,
  title = "Sign in",
}: SignInProps): ReactElement => {
  const client = useAuthClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitLabel = useMemo(
    () => submitProps?.children ?? "Sign in",
    [submitProps?.children]
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const message = await signIn(client, email, password);

      if (message) {
        setError(message);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
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
          Use your Supabase account to continue.
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
            autoComplete="current-password"
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
      <div className="flex items-center justify-between gap-3">
        <a className="text-sm underline underline-offset-4" href={signUpHref}>
          Create account
        </a>
        <button
          {...submitProps}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || submitProps?.disabled}
          type="submit"
        >
          {loading ? "Signing in..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
