import { ReactNode } from "react";

export type LayoutProps = Readonly<{
  children: ReactNode;
}>;

export type BoardStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: BoardStatus;
  dueDate: string | null;
  order: number;
};

export const BOARD_STATUSES: BoardStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const BOARD_STATUS_LABEL: Record<BoardStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};
