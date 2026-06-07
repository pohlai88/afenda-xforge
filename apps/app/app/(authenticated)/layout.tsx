import { getUser } from "@repo/auth/server";
import { redirect } from "next/navigation";
import type { ReactElement, ReactNode } from "react";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps): Promise<ReactElement> {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-8">
        {children}
      </div>
    </main>
  );
}
