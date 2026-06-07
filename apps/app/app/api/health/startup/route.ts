import { healthManager } from "../_manager";

export async function GET(): Promise<Response> {
  const result = await healthManager.getStartup();

  return Response.json(result, {
    status: result.status === "ok" ? 200 : 503,
  });
}
