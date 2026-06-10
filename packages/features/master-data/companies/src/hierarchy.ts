import type { Company, CompanyHierarchyNode } from "./schema.ts";

export const buildCompanyHierarchy = (
  records: Company[],
  parentCompanyId?: string
): CompanyHierarchyNode[] => {
  const nodesByParent = new Map<string, CompanyHierarchyNode[]>();

  for (const record of records) {
    const node: CompanyHierarchyNode = {
      ...record,
      children: [],
    };
    const parentKey = record.parentCompanyId ?? "";
    nodesByParent.set(parentKey, [
      ...(nodesByParent.get(parentKey) ?? []),
      node,
    ]);
  }

  const attachChildren = (
    node: CompanyHierarchyNode
  ): CompanyHierarchyNode => ({
    ...node,
    children: (nodesByParent.get(node.id) ?? []).map(attachChildren),
  });

  return (nodesByParent.get(parentCompanyId ?? "") ?? []).map(attachChildren);
};
