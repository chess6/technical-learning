import { Navigate, useParams } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { EquationBlock } from "../components/lesson/EquationBlock";
import { ExercisePanel } from "../components/lesson/ExercisePanel";
import { ExplanationBlock } from "../components/lesson/ExplanationBlock";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { GuidedScenePlayer } from "../components/lesson/GuidedScenePlayer";
import { LessonSummary } from "../components/lesson/LessonSummary";
import { LessonLayout } from "../components/layout/LessonLayout";
import { getLessonById } from "../lessons/registry";
import { getGuidedSceneFactory } from "../guided-scenes/registry";

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

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const primarySection = lesson.sections[0];
  const secondarySection = lesson.sections[1];

  return (
    <LessonLayout
      lesson={lesson}
      onReset={handleReset}
      explanation={
        <>
          {primarySection && (
            <ExplanationBlock
              title={primarySection.title}
              body={primarySection.body}
              observation={primarySection.observation}
            />
          )}
          {primarySection?.equation && (
            <EquationBlock tex={primarySection.equation} />
          )}
          {secondarySection && (
            <ExplanationBlock
              title={secondarySection.title}
              body={secondarySection.body}
              observation={secondarySection.observation}
            />
          )}
        </>
      }
      visualization={
        <GuidedScenePlayer
          key={`${lesson.id}:${lesson.guidedSceneId}:${resetToken}`}
          sceneId={lesson.guidedSceneId}
          createEngine={createEngine}
          title={`Guided animation: ${lesson.title}`}
        />
      }
      exploration={
        <ExplorationPanel
          key={`explore:${lesson.id}:${resetToken}`}
          explorationId={lesson.explorationId}
        />
      }
      exercises={<ExercisePanel exercises={lesson.exercises} />}
      summary={
        <LessonSummary
          takeaway={lesson.keyTakeaway}
          objectives={lesson.learningObjectives}
        />
      }
    />
  );
}
