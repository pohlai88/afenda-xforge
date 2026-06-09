import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import { createHrEmployeeRecordAction } from "../src/hr.workforce.records.actions.server.ts";
import { buildHrRecordsPageModel } from "../src/hr.workforce.records.page-model.server.ts";
import { toHrRecordsPageModelInput } from "../src/hr.workforce.records-search-params.parse.shared.ts";
import {
  resetHrEmployeeRecordsRepositoryForTesting,
  setHrEmployeeRecordsRepositoryPathForTesting,
} from "../src/repository.ts";

let repositoryPath = "";

beforeEach(() => {
  repositoryPath = resolve(
    tmpdir(),
    `afenda-employee-records-operational-${randomUUID()}.json`
  );
  setHrEmployeeRecordsRepositoryPathForTesting(repositoryPath);
  resetHrEmployeeRecordsRepositoryForTesting();
});

afterEach(() => {
  try {
    rmSync(repositoryPath, { force: true });
  } catch {
    // Best-effort cleanup for repository test artifacts.
  }
});

const createRecord = (employeeNumber: string, legalName: string): void => {
  const result = createHrEmployeeRecordAction(
    {
      employeeNumber,
      legalName,
    },
    {
      canWrite: true,
      canViewSensitive: true,
      organizationId: "org-1",
      userId: "hr-admin",
    }
  );

  assert.equal(result.ok, true);
};

test("pages directory reads and caps bulk windows", () => {
  createRecord("E001", "Directory One");
  createRecord("E002", "Directory Two");
  createRecord("E003", "Directory Three");

  const pagedInput = toHrRecordsPageModelInput({
    organizationId: "org-1",
    canWrite: false,
    canViewSensitive: false,
    searchParams: {
      page: "2",
      pageSize: "2",
    },
  });

  const pagedModel = buildHrRecordsPageModel(pagedInput);

  assert.equal(pagedModel.page, 2);
  assert.equal(pagedModel.pageSize, 2);
  assert.equal(pagedModel.totalCount, 3);
  assert.equal(pagedModel.hasNextPage, false);
  assert.equal(pagedModel.records.length, 1);
  assert.equal(pagedModel.records[0]?.employeeNumber, "E003");

  const cappedInput = toHrRecordsPageModelInput({
    organizationId: "org-1",
    canWrite: false,
    canViewSensitive: false,
    searchParams: {
      page: "1",
      pageSize: "250",
    },
  });

  assert.equal(cappedInput.pageSize, 100);

  const cappedModel = buildHrRecordsPageModel(cappedInput);

  assert.equal(cappedModel.pageSize, 100);
  assert.equal(cappedModel.totalCount, 3);
  assert.equal(cappedModel.records.length, 3);
});
