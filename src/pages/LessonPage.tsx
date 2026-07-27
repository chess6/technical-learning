import { Navigate, useParams } from "react-router-dom";
import { useCallback, useMemo, useState, type ReactNode } from "react";
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
import {
  getLessonVisual,
  isInlineMotionVisual,
} from "../components/lesson/lessonVisuals";
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

  const renderSection = (section: (typeof lesson.sections)[number]) => {
    const visual = section.visualId ? getLessonVisual(section.visualId) : null;
    const inlineMotion = isInlineMotionVisual(section.visualId);
    return (
      <div
        key={section.id}
        className={`lesson-section${inlineMotion ? " lesson-section--with-motion" : ""}`}
      >
        <div className="lesson-section__copy">
          <ExplanationBlock
            title={section.title}
            body={section.body}
            observation={section.observation}
          />
          {section.equation && <EquationBlock tex={section.equation} />}
          <DepthLayerList layers={section.layers} />
        </div>
        {visual}
      </div>
    );
  };

  const sectionsById = new Map(
    lesson.sections.map((section) => [section.id, renderSection(section)]),
  );

  const callouts = (lesson.callouts ?? []).map((callout) => (
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
  ));

  /**
   * Misconception callouts ride along with the COMBINED `worked` block. A lesson
   * that places its worked examples individually (`worked` + `workedId`) never
   * renders that block — so its callouts silently never reached the page. Seven
   * lessons were authoring staged misconceptions the learner could not see.
   *
   * Rather than adding a route-block kind for callouts (that would be new
   * schema), attach them to the LAST per-id worked block when no combined block
   * exists. That keeps every existing lesson rendering exactly as before and
   * puts the callouts where a combined block would have put them — after the
   * worked material they respond to.
   */
  const workedBlockIds = (lesson.route ?? [])
    .filter((block) => block.kind === "worked")
    .map((block) => (block.kind === "worked" ? block.workedId : undefined));
  const hasCombinedWorkedBlock =
    workedBlockIds.length > 0 && workedBlockIds.some((id) => id === undefined);
  const lastPlacedWorkedId = [...workedBlockIds]
    .reverse()
    .find((id): id is string => id !== undefined);
  const calloutsRideOnWorkedId =
    !hasCombinedWorkedBlock && callouts.length > 0
      ? lastPlacedWorkedId
      : undefined;

  const workedById = new Map(
    (lesson.workedExamples ?? []).map((example, index) => [
      example.id,
      <div key={example.id}>
        <WorkedExamplePanel
          examples={[example]}
          startNumber={index + 1}
          resetToken={resetToken}
          enableEigenClipStage={isEigenLesson}
          // Placed on its own by a `worked` route block: no heading sits above it,
          // so the example's own title is the section heading.
          headingLevel={2}
        />
        {calloutsRideOnWorkedId === example.id && callouts}
      </div>,
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

  /**
   * Clips a route places by scene id, rather than the lesson's own top-of-page
   * one. A lesson only needs this when a second animation belongs somewhere
   * specific — the eigenvectors bridge sits beside the characteristic-equation
   * theorem, because that is the statement it explains.
   */
  const visualsBySceneId = new Map(
    (lesson.route ?? []).flatMap((block) =>
      block.kind === "visual" && block.sceneId
        ? ([
            [
              block.sceneId,
              <GuidedScenePlayer
                key={`${lesson.id}:${block.sceneId}:${resetToken}`}
                sceneId={block.sceneId}
                // Its OWN factory: `createEngine` is bound to the lesson's
                // guidedSceneId, so sharing it would mount the top-of-page clip
                // here under a different heading.
                createEngine={getGuidedSceneFactory(block.sceneId)}
                // The block's own heading, so two clips on one page never
                // announce themselves with the same accessible name.
                title={`Guided animation: ${block.heading ?? lesson.title}`}
              />,
            ],
          ] as [string, ReactNode][])
        : [],
    ),
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
      visualsBySceneId={visualsBySceneId}
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
            {callouts}
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
