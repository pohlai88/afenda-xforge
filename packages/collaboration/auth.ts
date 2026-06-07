import "server-only";

import { Liveblocks as LiveblocksNode } from "@liveblocks/node";
import { loadCollaborationKeys } from "./keys.ts";

export type AuthenticateOptions = {
  orgId: string;
  userId: string;
  userInfo: Liveblocks["UserMeta"]["info"];
};

export const authenticate = async ({
  userId,
  orgId,
  userInfo,
}: AuthenticateOptions): Promise<Response> => {
  const { LIVEBLOCKS_SECRET } = loadCollaborationKeys();

  if (!LIVEBLOCKS_SECRET) {
    throw new Error("LIVEBLOCKS_SECRET is not set");
  }

  const liveblocks = new LiveblocksNode({ secret: LIVEBLOCKS_SECRET });
  const session = liveblocks.prepareSession(userId, { userInfo });

  session.allow(`${orgId}:*`, session.FULL_ACCESS);

  const { status, body } = await session.authorize();

  return new Response(body, { status });
};
