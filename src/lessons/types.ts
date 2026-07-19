export type Matrix2x2 = [[number, number], [number, number]];

export type Vector2 = [number, number];

export type MatrixExample = {
  id: string;
  title: string;
  matrix: Matrix2x2;
  inputVector?: Vector2;
};

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

export type LessonDefinition = {
  id: string;
  title: string;
  subtitle: string;
  learningObjectives: string[];
  sections: LessonSection[];
  guidedSceneId: string;
  explorationId: string;
  exercises: ExerciseDefinition[];
  keyTakeaway: string;
  /** Shared example id used by both guided scene and exploration. */
  exampleId?: string;
};
