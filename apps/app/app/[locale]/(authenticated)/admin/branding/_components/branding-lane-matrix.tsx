"use client";

import type {
  AfendaTenantBrandingSettings as TenantBrandingSettings,
} from "@repo/design-system/contracts/afenda/customization";
import type { AfendaErpVisualLaneId as ErpVisualLaneId } from "@repo/design-system/contracts/afenda/registries";
import {
  AFENDA_ERP_VISUAL_LANE_IDS as ERP_VISUAL_LANE_IDS,
  AFENDA_ERP_VISUAL_LANES as ERP_VISUAL_LANES,
} from "@repo/design-system/contracts/afenda/registries";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import {
  filterModuleEntries,
  formatFeatureLabel,
  getCatalogResolutionLabel,
  getFeatureDomain,
  isModuleLaneOverride,
  resolveAssignedLane,
  SORTED_MODULE_ENTRIES,
} from "./branding-settings.utils.ts";

type BrandingLaneMatrixProps = {
  branding: TenantBrandingSettings;
  canWrite: boolean;
  onLaneChange: (featureId: string, laneId: ErpVisualLaneId) => void;
};

const laneTitleById = Object.fromEntries(
  ERP_VISUAL_LANES.map((lane) => [lane.id, lane.title])
) as Record<ErpVisualLaneId, string>;

export function BrandingLaneMatrix({
  branding,
  canWrite,
  onLaneChange,
}: BrandingLaneMatrixProps): ReactElement {
  const [query, setQuery] = useState("");
  const filteredEntries = useMemo(
    () => filterModuleEntries(SORTED_MODULE_ENTRIES, query, branding),
    [query, branding]
  );

  return (
    <Card>
      <CardHeader className="gap-4 border-border border-b">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Module lane matrix</CardTitle>
            <CardDescription>
              Assign ERP visual lanes per feature. Overrides catalog defaults
              only — never primary brand or status tones.
            </CardDescription>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <Label htmlFor="lane-matrix-search">Filter modules</Label>
            <Input
              id="lane-matrix-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search feature, lane, or domain…"
              value={query}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="min-w-[14rem]">Module</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Catalog default</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead className="min-w-[12rem]">Assigned lane</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map(([featureId, defaultLane]) => {
                const assignedLane = resolveAssignedLane(branding, featureId);
                const isOverride = isModuleLaneOverride(branding, featureId);

                return (
                  <TableRow key={featureId}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {formatFeatureLabel(featureId)}
                        </p>
                        <p className="font-mono text-muted-foreground text-xs">
                          {featureId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">
                        {getFeatureDomain(featureId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{defaultLane}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">
                        {getCatalogResolutionLabel(featureId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={!canWrite}
                        onValueChange={(value) =>
                          onLaneChange(featureId, value as ErpVisualLaneId)
                        }
                        value={assignedLane}
                      >
                        <SelectTrigger
                          aria-label={`Lane for ${featureId}`}
                          className="w-full min-w-[10rem]"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ERP_VISUAL_LANE_IDS.map((laneId) => (
                            <SelectItem key={laneId} value={laneId}>
                              {laneTitleById[laneId] ?? laneId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="lane">
                          {laneTitleById[assignedLane] ?? assignedLane}
                        </Badge>
                        {isOverride ? (
                          <Badge size="sm" variant="info-outline">
                            Override
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {filteredEntries.length === 0 ? (
          <p className="px-6 py-8 text-center text-muted-foreground text-sm">
            No modules match your filter.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
