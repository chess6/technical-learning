import { Navigate, useParams } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { EquationBlock } from "../components/lesson/EquationBlock";
import { ExercisePanel } from "../components/lesson/ExercisePanel";
import { ExplanationBlock } from "../components/lesson/ExplanationBlock";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { Checkpoint } from "../components/lesson/Checkpoint";
import { MotivatingQuestion } from "../components/lesson/MotivatingQuestion";
import { GuidedScenePlayer } from "../components/lesson/GuidedScenePlayer";
import { EigenClipStage } from "../components/lesson/EigenClipStage";
import { LessonSummary } from "../components/lesson/LessonSummary";
import { WorkedExamplePanel } from "../components/lesson/WorkedExamplePanel";
import { DepthLayerList } from "../components/lesson/DepthLayer";
import { getLessonVisual } from "../components/lesson/lessonVisuals";
import { MisconceptionCallout } from "../components/lesson/MisconceptionCallout";
import { EigenSolutionDiagram } from "../components/lesson/solutionVisuals/EigenSolutionDiagram";
import { LessonLayout } from "../components/layout/LessonLayout";
import { getLessonById } from "../lessons/registry";
import { getGuidedSceneFactory } from "../guided-scenes/registry";
import { getExplorer } from "../explorations/registry";

const EIGEN_LESSON_ID = "eigenvectors";

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const [resetToken, setResetToken] = useState(0);

  const handleReset = useCallback(() => {
    setResetToken((token) => token + 1);
  }, []);

  // Stable factory identity per scene; changing the scene disposes + recreates
  // the engine (correction #1). Reset additionally remounts via the component
  // key below, which disposes and recreates the engine cleanly.
  const sceneId = lesson?.guidedSceneId ?? "none";
  const createEngine = useMemo(() => getGuidedSceneFactory(sceneId), [sceneId]);
  const isEigenLesson = lesson?.id === EIGEN_LESSON_ID;

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const Explorer = getExplorer(lesson.explorationId);

  const renderSection = (section: (typeof lesson.sections)[number]) => (
    <div key={section.id} className="lesson-section">
      <ExplanationBlock
        title={section.title}
        body={section.body}
        observation={section.observation}
      />
      {section.equation && <EquationBlock tex={section.equation} />}
      <DepthLayerList layers={section.layers} />
      {section.visualId && getLessonVisual(section.visualId)}
    </div>
  );

  const sectionsById = new Map(
    lesson.sections.map((section) => [section.id, renderSection(section)]),
  );

  const workedById = new Map(
    (lesson.workedExamples ?? []).map((example, index) => [
      example.id,
      <WorkedExamplePanel
        key={example.id}
        examples={[example]}
        startNumber={index + 1}
        resetToken={resetToken}
        enableEigenClipStage={isEigenLesson}
      />,
    ]),
  );

  // Extra checkpoints (beyond the single default) referenced by `check` blocks.
  const checkpointsById = new Map(
    (lesson.checkpoints ?? [])
      .filter((cp) => cp.id)
      .map((cp) => [
        cp.id!,
        <Checkpoint key={cp.id} prompt={cp.prompt} answer={cp.answer} />,
      ]),
  );

  const allExercises = lesson.exercises ?? [];
  const renderExercises = (exerciseIds?: string[]) => {
    const subset = exerciseIds
      ? allExercises.filter((ex) => exerciseIds.includes(ex.id))
      : allExercises;
    if (subset.length === 0) return undefined;
    return <ExercisePanel exercises={subset} />;
  };

  return (
    <LessonLayout
      lesson={lesson}
      onReset={handleReset}
      sectionsById={sectionsById}
      workedById={workedById}
      motivation={
        lesson.motivatingQuestion && (
          <MotivatingQuestion question={lesson.motivatingQuestion} />
        )
      }
      explanation={lesson.sections.map(renderSection)}
      visualization={
        isEigenLesson ? (
          <EigenClipStage
            key={`${lesson.id}:${lesson.guidedSceneId}:${resetToken}`}
            sceneId={lesson.guidedSceneId}
            title={`Guided animation: ${lesson.title}`}
            resetToken={resetToken}
          />
        ) : (
          <GuidedScenePlayer
            key={`${lesson.id}:${lesson.guidedSceneId}:${resetToken}`}
            sceneId={lesson.guidedSceneId}
            createEngine={createEngine}
            title={`Guided animation: ${lesson.title}`}
          />
        )
      }
      checkpoint={
        lesson.checkpoint && (
          <Checkpoint
            prompt={lesson.checkpoint.prompt}
            answer={lesson.checkpoint.answer}
          />
        )
      }
      checkpointsById={checkpointsById}
      workedExamples={
        (lesson.workedExamples && lesson.workedExamples.length > 0) ||
        (lesson.callouts && lesson.callouts.length > 0) ? (
          <>
            {lesson.workedExamples && lesson.workedExamples.length > 0 && (
              <WorkedExamplePanel
                examples={lesson.workedExamples}
                resetToken={resetToken}
                enableEigenClipStage={isEigenLesson}
              />
            )}
            {lesson.callouts?.map((callout) => (
              <MisconceptionCallout
                key={callout.id}
                title={callout.title}
                belief={callout.belief}
                confront={callout.confront}
                resolve={callout.resolve}
                visual={
                  callout.solutionVisualId ? (
                    <EigenSolutionDiagram
                      exampleId={callout.exampleId}
                      highlightLambda={callout.highlightLambda}
                      height={200}
                      ariaLabel={callout.title}
                    />
                  ) : undefined
                }
              />
            ))}
          </>
        ) : undefined
      }
      exploration={
        Explorer ? (
          <div key={`explore:${lesson.id}:${resetToken}`}>
            <Explorer />
          </div>
        ) : (
          <ExplorationPanel
            key={`explore:${lesson.id}:${resetToken}`}
            explorationId={lesson.explorationId}
            title="Interactive exploration"
            description="This lesson's interactive exploration arrives in a later milestone."
          />
        )
      }
      renderExercises={renderExercises}
      summary={
        lesson.keyTakeaway || lesson.structuredSummary ? (
          <LessonSummary
            takeaway={lesson.keyTakeaway ?? ""}
            objectives={lesson.learningObjectives}
            structured={lesson.structuredSummary}
          />
        ) : undefined
      }
    />
  );
}
