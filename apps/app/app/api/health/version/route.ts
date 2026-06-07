import { healthManager } from "../_manager";

export function GET(): Response {
  return Response.json(healthManager.getVersion(), {
    status: 200,
  });
}
