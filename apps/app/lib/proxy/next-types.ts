import type { mergeNextResponses } from "@repo/api-proxy";
import type { authMiddleware } from "@repo/auth/proxy";
import type { NextRequest, NextResponse } from "next/server";

/**
 * pnpm can install multiple Next.js type instances (e.g. optional OpenTelemetry peers).
 * Bridge app middleware types to workspace package signatures without changing runtime behavior.
 */
export type PackageNextRequest = Parameters<typeof authMiddleware>[0];
export type PackageNextResponse = Parameters<typeof mergeNextResponses>[0];

export const toPackageNextRequest = (
  request: NextRequest
): PackageNextRequest => request as unknown as PackageNextRequest;

export const toPackageNextResponse = (
  response: NextResponse
): PackageNextResponse => response as unknown as PackageNextResponse;

export const fromPackageNextResponse = (
  response: PackageNextResponse
): NextResponse => response as unknown as NextResponse;
