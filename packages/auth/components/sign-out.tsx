"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { useState } from "react";
import { useAuthClient } from "../provider.tsx";

export type SignOutProps = {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly redirectTo?: string;
  readonly buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
};

export const SignOut = ({
  children = "Sign out",
  className,
  redirectTo = "/sign-in",
  buttonProps,
}: SignOutProps): ReactElement => {
  const client = useAuthClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setLoading(true);

    try {
      await client.auth.signOut();
      router.replace(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      {...buttonProps}
      className={className}
      disabled={loading || buttonProps?.disabled}
      onClick={handleClick}
      type="button"
    >
      {loading ? "Signing out..." : children}
    </button>
  );
};
