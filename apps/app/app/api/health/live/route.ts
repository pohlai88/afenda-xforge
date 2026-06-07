import { healthManager } from "../_manager";

export async function GET(): Promise<Response> {
  const result = await healthManager.getLiveness();

  return Response.json(result, {
    status: result.status === "ok" ? 200 : 503,
  });
}
