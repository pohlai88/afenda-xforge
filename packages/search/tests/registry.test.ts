import { afterEach, describe, expect, it } from "vitest";
import {
  buildSearchIndexName,
  clearSearchIndexRegistry,
  listSearchIndexDefinitions,
  registerSearchIndex,
  registerSearchIndices,
  requireSearchIndexDefinition,
} from "../registry.ts";

afterEach(() => {
  clearSearchIndexRegistry();
});

describe("search registry", () => {
  it("normalizes keys before registration", () => {
    const definition = registerSearchIndex({
      key: "  Customer Records  ",
      searchableAttributes: ["name"],
    });

    expect(definition.key).toBe("customer_records");
    expect(requireSearchIndexDefinition("customer records").key).toBe(
      "customer_records"
    );
  });

  it("registers batches atomically", () => {
    expect(() =>
      registerSearchIndices([
        { key: "first", searchableAttributes: ["title"] },
        { key: "first", searchableAttributes: ["description"] },
      ])
    ).toThrow(/already registered/i);

    expect(listSearchIndexDefinitions()).toEqual([]);
  });

  it("builds safe index names", () => {
    expect(buildSearchIndexName("Order History", "X Forge")).toBe(
      "x_forge_order_history"
    );
  });

  it("rejects empty index names", () => {
    expect(() => buildSearchIndexName("!!!")).toThrow(
      /must contain at least one ASCII letter or number/i
    );
  });

  it("does not leak mutable registry definitions", () => {
    const registeredDefinition = registerSearchIndex({
      filterableAttributes: ["tenantId"],
      key: "customers",
      searchableAttributes: ["name"],
      synonyms: {
        employee: ["staff"],
      },
    });

    registeredDefinition.searchableAttributes.push("email");
    registeredDefinition.filterableAttributes?.push("companyId");
    registeredDefinition.synonyms?.employee.push("worker");

    const definition = requireSearchIndexDefinition("customers");

    expect(definition.searchableAttributes).toEqual(["name"]);
    expect(definition.filterableAttributes).toEqual(["tenantId"]);
    expect(definition.synonyms).toEqual({
      employee: ["staff"],
    });
  });
});
