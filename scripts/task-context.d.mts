export interface TaskContextArgs {
  root: string;
  mode: "A" | "B" | "C" | "D";
  lesson: string;
  course?: string;
}

export interface ParsedTaskArgs extends Omit<TaskContextArgs, "root"> {
  help?: false;
}

export function parseTaskArgs(argv: string[]): ParsedTaskArgs | {help: true};

export function buildTaskContext(args: TaskContextArgs): string;
