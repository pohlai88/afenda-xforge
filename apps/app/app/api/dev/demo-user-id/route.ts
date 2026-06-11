import {
  formatDemoUserIdEnv,
  getCurrentAuthenticatedUserId,
} from "@repo/auth/server";
import { withRequestLogging } from "@repo/logger";

const handleGet = async (): Promise<Response> => {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", {
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
      status: 404,
    });
  }

  const userId = await getCurrentAuthenticatedUserId();

  if (!userId) {
    return new Response("Sign in first to resolve XFORGE_DEMO_USER_ID.", {
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
      status: 401,
    });
  }

  return new Response(formatDemoUserIdEnv(userId), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
};

export const GET = withRequestLogging(handleGet);
