import { SIDEBAR_COLOR_TOKENS } from "../contracts/color.contract";

type CssDeclaration = readonly [name: string, value: string];

/**
 * Menu / sidebar chrome tokens. Values live in `sidebar-tokens.ts`; this module
 * only maps contract names to @theme inline color utilities.
 */
export function sidebarRootDeclarations(
  declarations: readonly CssDeclaration[]
): readonly CssDeclaration[] {
  const byName = new Map(declarations.map(([name, value]) => [name, value]));

  return SIDEBAR_COLOR_TOKENS.map((token) => {
    const cssVar = `--${token}`;
    const value = byName.get(cssVar);

    if (!value) {
      throw new Error(`sidebar token missing declaration for ${cssVar}`);
    }

    return [cssVar, value] as const;
  });
}

export const SIDEBAR_THEME_INLINE_DECLARATIONS: readonly CssDeclaration[] =
  SIDEBAR_COLOR_TOKENS.map(
    (token) => [`--color-${token}`, `var(--${token})`] as const
  );
