"use client";

import type { ReactElement } from "react";
import {
  ORBIT_SYNTAX_GUIDE_EXAMPLE,
  ORBIT_SYNTAX_GUIDE_LINES,
} from "./orbit-trail.ts";
import {
  WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS,
  WORKSPACE_SIDEBAR_ROW_TEXT_CLASS,
} from "./orbit-trail-sidebar.classes.ts";

export function OrbitSyntaxGuideDropdown(): ReactElement {
  return (
    <div
      className="min-w-0 space-y-0.5 rounded-md bg-sidebar-accent/20 py-1"
      role="tabpanel"
    >
      <div className="space-y-0.5 px-2">
        <p className={WORKSPACE_SIDEBAR_ROW_TEXT_CLASS}>
          {ORBIT_SYNTAX_GUIDE_EXAMPLE.input}
        </p>
        <p className={WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS}>
          {ORBIT_SYNTAX_GUIDE_EXAMPLE.output}
        </p>
      </div>

      <ul className="space-y-0.5">
        {ORBIT_SYNTAX_GUIDE_LINES.map((line) => (
          <li
            className={`grid min-w-0 grid-cols-[2.25rem_1fr] gap-x-1.5 px-2 ${WORKSPACE_SIDEBAR_ROW_TEXT_CLASS}`}
            key={`${line.symbol}-${line.meaning}`}
          >
            <span className="text-sidebar-foreground">{line.symbol}</span>
            <span className={WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS}>
              {line.meaning}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
