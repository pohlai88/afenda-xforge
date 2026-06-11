export type WorkspaceKeyboardShortcutsFeatureManifest = {
  description: string;
  id: string;
  packageName: string;
  title: string;
};

export const workspaceKeyboardShortcutsFeatureManifest: WorkspaceKeyboardShortcutsFeatureManifest =
  {
    description:
      "Governed workspace keyboard shortcut resolution, policy, and personalization.",
    id: "workspace.keyboard-shortcuts",
    packageName: "@repo/features-workspace-keyboard-shortcuts",
    title: "Workspace keyboard shortcuts",
  };
