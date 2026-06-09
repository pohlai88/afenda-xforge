import { ErrorStatusCode, MeiliSearchApiError } from "meilisearch";
import { describe, expect, it } from "vitest";
import {
  assertNonNegativeInteger,
  assertPositiveInteger,
  buildIndexSettings,
  buildSearchParams,
  buildSettingsSignature,
  extractSuggestionText,
  isMissingIndexError,
} from "../meilisearch/internal.ts";
import type { SearchQueryOptions } from "../types.ts";

describe("search helpers", () => {
  it("keeps empty suggestion text out of the result set", () => {
    expect(
      extractSuggestionText({
        description: "  Monthly payroll run  ",
        id: "1",
        tenantId: "tenant-1",
        title: "   ",
      })
    ).toBe("Monthly payroll run");
  });

  it("builds stable settings signatures", () => {
    const left = buildSettingsSignature(
      buildIndexSettings({
        key: "customers",
        searchableAttributes: ["name"],
        synonyms: {
          beta: ["b"],
          alpha: ["a"],
        },
      })
    );
    const right = buildSettingsSignature(
      buildIndexSettings({
        key: "customers",
        searchableAttributes: ["name"],
        synonyms: {
          alpha: ["a"],
          beta: ["b"],
        },
      })
    );

    expect(left).toBe(right);
  });

  it("builds consistent search params", () => {
    const options: Pick<
      SearchQueryOptions,
      | "attributesToHighlight"
      | "filter"
      | "highlightPostTag"
      | "highlightPreTag"
      | "sort"
    > = {
      attributesToHighlight: ["title"],
      filter: ["tenantId = 1"],
      highlightPostTag: "</mark>",
      highlightPreTag: "<mark>",
      sort: ["createdAt:desc"],
    };

    expect(buildSearchParams(options, 25, 10)).toMatchObject({
      attributesToHighlight: ["title"],
      filter: ["tenantId = 1"],
      highlightPostTag: "</mark>",
      highlightPreTag: "<mark>",
      limit: 25,
      offset: 10,
      showRankingScore: true,
      sort: ["createdAt:desc"],
    });
  });

  it("does not inject implicit stop words", () => {
    expect(
      buildIndexSettings({
        key: "customers",
        searchableAttributes: ["name"],
      }).stopWords
    ).toBeUndefined();
  });

  it("validates positive integers", () => {
    expect(assertPositiveInteger(10, "Batch size")).toBe(10);
    expect(() => assertPositiveInteger(0, "Batch size")).toThrow(
      /Batch size must be a positive integer/i
    );
  });

  it("validates non-negative integers", () => {
    expect(assertNonNegativeInteger(0, "Offset")).toBe(0);
    expect(() => assertNonNegativeInteger(-1, "Offset")).toThrow(
      /Offset must be a non-negative integer/i
    );
  });

  it("detects missing-index errors", () => {
    const error = new MeiliSearchApiError(
      new Response("missing", { status: 404, statusText: "Not Found" }),
      {
        code: ErrorStatusCode.INDEX_NOT_FOUND,
        link: "https://example.invalid",
        message: "Index not found",
        type: "invalid_request",
      }
    );

    expect(isMissingIndexError(error)).toBe(true);
    expect(isMissingIndexError(new Error("boom"))).toBe(false);
  });
});
