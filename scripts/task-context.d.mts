export interface TaskContextArgs {
  root: string;
  mode: "A" | "B" | "C" | "D";
  /** Required for modes B, C and D. Mode A operates on a course instead. */
  lesson?: string;
  course?: string;
}

export interface CourseContextArgs {
  root: string;
  course: string;
}

export interface ParsedTaskArgs extends Omit<TaskContextArgs, "root"> {
  help?: false;
}

export function parseTaskArgs(argv: string[]): ParsedTaskArgs | {help: true};

export function buildCourseContext(args: CourseContextArgs): string;

export function buildTaskContext(args: TaskContextArgs): string;
