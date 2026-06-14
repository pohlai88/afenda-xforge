import type { AfendaPresentationMetadata } from "../contracts/afenda/presentation-metadata.contract";
import { parseAfendaPresentationMetadata } from "../contracts/afenda/presentation-metadata.contract";
import {
  AFENDA_CONTROL_SIZE_TAILWIND_CLASSES,
  AFENDA_LANE_ACCENT_TAILWIND_CLASSES,
  AFENDA_STATUS_TONE_TAILWIND,
  resolveDensityDataAttribute,
  resolveVariantTailwindClasses,
} from "../contracts/afenda/catalogs/presentation-resolution.catalog";
import {
  createEmptyResolvedPresentationBundle,
  type AfendaResolvedPresentationBundle,
} from "../contracts/afenda/presentation-resolution.contract";
import {
  getAfendaComponentTokenBindingsForFamily,
  type AfendaComponentTokenBinding,
} from "../contracts/afenda/registries/component-token.registry";
import type { AfendaPresentationVariantFamily } from "../contracts/afenda/presentation-metadata.contract";

function resolveComponentFamily(
  input: AfendaPresentationMetadata
): AfendaPresentationVariantFamily | undefined {
  return input.variantFamily ?? input.componentFamily;
}

function applyComponentTokenBindings(
  family: AfendaPresentationMetadata["componentFamily"],
  density: AfendaPresentationMetadata["density"],
  cssVariables: Record<`--${string}`, string>
): void {
  if (!family) {
    return;
  }

  const bindings = getAfendaComponentTokenBindingsForFamily(family);

  for (const binding of selectComponentTokenBindings(bindings, density)) {
    cssVariables[binding.cssVariable] = `var(${binding.cssVariable})`;
  }
}

function selectComponentTokenBindings(
  bindings: readonly AfendaComponentTokenBinding[],
  density: AfendaPresentationMetadata["density"]
): readonly AfendaComponentTokenBinding[] {
  const staticBindings = bindings.filter(
    (binding) => binding.resolveFrom === "static" && !binding.densityMode
  );
  const densityBindings = bindings.filter((binding) => {
    if (binding.resolveFrom !== "density") {
      return false;
    }
    if (!binding.densityMode) {
      return true;
    }
    return binding.densityMode === density;
  });

  const selected = new Map<string, AfendaComponentTokenBinding>();

  for (const binding of [...staticBindings, ...densityBindings]) {
    selected.set(`${binding.family}:${binding.property}`, binding);
  }

  return [...selected.values()];
}

export function resolvePresentationMetadata(
  input: AfendaPresentationMetadata | unknown
): AfendaResolvedPresentationBundle {
  const metadata = parseAfendaPresentationMetadata(input);
  const bundle = createEmptyResolvedPresentationBundle();
  const cssVariables: Record<`--${string}`, string> = {
    ...bundle.cssVariables,
  };
  const tailwindClasses: string[] = [...bundle.tailwindClasses];
  const dataAttributes: Record<string, string> = { ...bundle.dataAttributes };

  if (metadata.density) {
    Object.assign(dataAttributes, resolveDensityDataAttribute(metadata.density));
  }

  applyComponentTokenBindings(
    metadata.componentFamily,
    metadata.density,
    cssVariables
  );

  const variantFamily = resolveComponentFamily(metadata);

  if (variantFamily && metadata.variant) {
    tailwindClasses.push(
      ...resolveVariantTailwindClasses(variantFamily, metadata.variant)
    );
  }

  if (metadata.tone) {
    tailwindClasses.push(...AFENDA_STATUS_TONE_TAILWIND[metadata.tone]);
  }

  if (metadata.lane) {
    cssVariables["--lane-active-id"] = metadata.lane;
    tailwindClasses.push(...AFENDA_LANE_ACCENT_TAILWIND_CLASSES);
  }

  if (metadata.size) {
    tailwindClasses.push(...AFENDA_CONTROL_SIZE_TAILWIND_CLASSES[metadata.size]);
  }

  return {
    cssVariables,
    tailwindClasses: [...new Set(tailwindClasses)],
    dataAttributes,
    governanceReferences: bundle.governanceReferences,
  };
}
