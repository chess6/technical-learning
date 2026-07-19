import { Navigate, useParams } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { EquationBlock } from "../components/lesson/EquationBlock";
import { ExercisePanel } from "../components/lesson/ExercisePanel";
import { ExplanationBlock } from "../components/lesson/ExplanationBlock";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { Checkpoint } from "../components/lesson/Checkpoint";
import { MotivatingQuestion } from "../components/lesson/MotivatingQuestion";
import { GuidedScenePlayer } from "../components/lesson/GuidedScenePlayer";
import { LessonSummary } from "../components/lesson/LessonSummary";
import { LessonLayout } from "../components/layout/LessonLayout";
import { getLessonById } from "../lessons/registry";
import { getGuidedSceneFactory } from "../guided-scenes/registry";
import { getExplorer } from "../explorations/registry";

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

  const Explorer = getExplorer(lesson.explorationId);

  return (
    <LessonLayout
      lesson={lesson}
      onReset={handleReset}
      motivation={
        lesson.motivatingQuestion && (
          <MotivatingQuestion question={lesson.motivatingQuestion} />
        )
      }
      explanation={lesson.sections.map((section) => (
        <div key={section.id} className="lesson-section">
          <ExplanationBlock
            title={section.title}
            body={section.body}
            observation={section.observation}
          />
          {section.equation && <EquationBlock tex={section.equation} />}
        </div>
      ))}
      visualization={
        <GuidedScenePlayer
          key={`${lesson.id}:${lesson.guidedSceneId}:${resetToken}`}
          sceneId={lesson.guidedSceneId}
          createEngine={createEngine}
          title={`Guided animation: ${lesson.title}`}
        />
      }
      checkpoint={
        lesson.checkpoint && (
          <Checkpoint
            prompt={lesson.checkpoint.prompt}
            answer={lesson.checkpoint.answer}
          />
        )
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
