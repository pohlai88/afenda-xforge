export type TaskManagerTab = "all" | "tasks" | "files";

export type TaskManagerTask = {
  id: string;
  label: string;
  completed: boolean;
};

export type TaskManagerSection = {
  id: string;
  label: string;
  tasks: TaskManagerTask[];
};

export type TaskManagerFile = {
  id: string;
  name: string;
  sizeLabel: string;
};
