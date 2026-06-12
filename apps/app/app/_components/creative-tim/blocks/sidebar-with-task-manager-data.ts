import type {
  TaskManagerFile,
  TaskManagerSection,
} from "./sidebar-with-task-manager-types.ts";

export const taskManagerSections: TaskManagerSection[] = [
  {
    id: "design",
    label: "Design sprint",
    tasks: [
      { id: "t-1", label: "Review navigation wireframes", completed: true },
      { id: "t-2", label: "Finalize dashboard cards", completed: false },
      { id: "t-3", label: "Ship empty states", completed: false },
    ],
  },
  {
    id: "launch",
    label: "Launch checklist",
    tasks: [
      { id: "t-4", label: "QA workspace search", completed: false },
      { id: "t-5", label: "Update onboarding copy", completed: true },
      { id: "t-6", label: "Publish release notes", completed: false },
    ],
  },
];

export const taskManagerFiles: TaskManagerFile[] = [
  { id: "f-1", name: "workspace-brief.pdf", sizeLabel: "1.2 MB" },
  { id: "f-2", name: "task-manager-mockup.png", sizeLabel: "840 KB" },
  { id: "f-3", name: "search-architecture.md", sizeLabel: "24 KB" },
];
