import { ClipboardListIcon } from "lucide-react";
import TaskDialog from "@/components/TaskDialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcnui/empty";

const KanbanEmptyState = () => {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardListIcon />
        </EmptyMedia>
        <EmptyTitle>No tasks yet</EmptyTitle>
        <EmptyDescription>
          Create your first task to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <TaskDialog />
      </EmptyContent>
    </Empty>
  );
};

export default KanbanEmptyState;
