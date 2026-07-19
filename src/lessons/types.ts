import type { Vector2 } from "../math/types";

export type { Matrix2x2, MatrixExample, Vector2 } from "../math/types";

export type ExerciseDefinition =
  | {
      id: string;
      type: "multiple-choice";
      prompt: string;
      choices: string[];
      correctChoice: number;
      explanation: string;
    }
  | {
      id: string;
      type: "numeric";
      prompt: string;
      expected: number;
      tolerance?: number;
      explanation: string;
    }
  | {
      id: string;
      type: "vector";
      prompt: string;
      expected: Vector2;
      tolerance?: number;
      explanation: string;
    }
  | {
      id: string;
      type: "prediction";
      prompt: string;
      reveal: string;
    };

export type LessonSection = {
  id: string;
  title: string;
  body: string;
  equation?: string;
  observation?: string;
};

/** A short conceptual check-in shown between the guided scene and exploration. */
export type LessonCheckpoint = {
  prompt: string;
  answer: string;
};

export type LessonDefinition = {
  id: string;
  title: string;
  subtitle: string;
  learningObjectives: string[];
  /** A prediction/motivating question shown before the explanation. */
  motivatingQuestion?: string;
  sections: LessonSection[];
  guidedSceneId: string;
  explorationId: string;
  checkpoint?: LessonCheckpoint;
  exercises: ExerciseDefinition[];
  keyTakeaway: string;
  /** Shared example id used by both guided scene and exploration. */
  exampleId?: string;
};
