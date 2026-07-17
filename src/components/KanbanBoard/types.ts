export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
};

export type KanbanColumnDef = {
  id: string;
  label: string;
};
