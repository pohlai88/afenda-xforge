import { getUser } from "@repo/auth/server";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

export default async function HomePage(): Promise<ReactElement> {
  const user = await getUser();

  redirect(user ? "/dashboard" : "/sign-in");
}
