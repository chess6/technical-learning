/**
 * Shared phase-correct capability renderers for the module runner (Package F).
 *
 * This is the approved dedicated renderer (kept separate from the lesson
 * `ExercisePanel` bodies) so exam CAPTURE cannot leak correctness by
 * construction: capture inputs paint no `data-state` and reveal nothing until
 * submit. Grading/serialization still reuse the PURE capability layer (the
 * serialized answer shapes here are exactly what `capability.parseAnswer`
 * accepts, so `gradeSnapshot` can grade them against the snapshot).
 *
 * Supported kinds cover the pilot set AND the atomic kinds the upcoming Package G
 * sets need: `multiple-choice`, `numeric`, `vector`, `matrix-entry`,
 * `construct-in-explorer` (auto-graded) and `self-check` (human-scored). The
 * scaffolded `exercise-sequence` / reveal `prediction` kinds are intentionally
 * NOT exam-capturable (their model is progressive reveal); Package G authors
 * atomic items for exam sets instead.
 */

import { useState } from "react";
import type { AttemptItemResponse, AttemptItemSnapshot } from "../../platform/learnerState";
import type { JsonValue } from "../../platform/json";
import type {
  EliminationConfig,
  MatrixEntryConfig,
  SolutionSetConfig,
} from "../../lessons/capabilities";
import {
  MATRIX_ENTRY_ID,
  CONSTRUCT_IN_EXPLORER_ID,
  ELIMINATION_ID,
  SELF_CHECK_ID,
  SOLUTION_SET_ID,
} from "../../lessons/capabilities";
import { definitionFromSnapshot } from "../../lessons/attemptSnapshot";
import type { ExerciseDefinition, SolutionReveal as SolutionRevealData } from "../../lessons/types";
import { ProseWithMath } from "../lesson/ProseWithMath";
import { SolutionReveal } from "../lesson/SolutionReveal";

export const SUPPORTED_CAPTURE_KINDS: readonly string[] = [
  "multiple-choice",
  "numeric",
  "vector",
  MATRIX_ENTRY_ID,
  CONSTRUCT_IN_EXPLORER_ID,
  SELF_CHECK_ID,
  SOLUTION_SET_ID,
  ELIMINATION_ID,
];

export function isCaptureSupported(item: AttemptItemSnapshot): boolean {
  return SUPPORTED_CAPTURE_KINDS.includes(item.capabilityId);
}

export function readField(answer: JsonValue | undefined, field: string): JsonValue | undefined {
  if (answer && typeof answer === "object" && !Array.isArray(answer)) {
    return (answer as Record<string, JsonValue>)[field];
  }
  return undefined;
}

function parseNum(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/* -------------------------------------------------------------------------- */
/* Capture (exam) — NO correctness or reveal shown.                            */
/* -------------------------------------------------------------------------- */

export function CaptureField({
  item,
  answer,
  onAnswer,
}: {
  item: AttemptItemSnapshot;
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  const exercise = definitionFromSnapshot(item);
  switch (item.capabilityId) {
    case "multiple-choice":
      return <MultipleChoiceCapture exercise={exercise} answer={answer} onAnswer={onAnswer} />;
    case "numeric":
      return <NumericCapture answer={answer} onAnswer={onAnswer} />;
    case "vector":
      return <VectorCapture answer={answer} onAnswer={onAnswer} />;
    case MATRIX_ENTRY_ID:
      return <MatrixEntryCapture exercise={exercise} answer={answer} onAnswer={onAnswer} />;
    case CONSTRUCT_IN_EXPLORER_ID:
      return <ConstructCapture answer={answer} onAnswer={onAnswer} />;
    case SELF_CHECK_ID:
      return <SelfCheckCapture answer={answer} onAnswer={onAnswer} />;
    case SOLUTION_SET_ID:
      return <SolutionSetCapture exercise={exercise} answer={answer} onAnswer={onAnswer} />;
    case ELIMINATION_ID:
      return <EliminationCapture exercise={exercise} answer={answer} onAnswer={onAnswer} />;
    default:
      return (
        <p className="module-runner__unsupported">
          This item type isn’t available in the review runner yet.
        </p>
      );
  }
}

function MultipleChoiceCapture({
  exercise,
  answer,
  onAnswer,
}: {
  exercise: ExerciseDefinition;
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  if (exercise.type !== "multiple-choice") return null;
  const selected = readField(answer, "choice");
  return (
    <ul className="module-runner__choices">
      {exercise.choices.map((choice, index) => (
        <li key={index}>
          <button
            type="button"
            className="module-runner__choice"
            aria-pressed={selected === index}
            data-choice-index={index}
            onClick={() => onAnswer({ choice: index })}
          >
            <span className="module-runner__choice-letter" aria-hidden="true">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="module-runner__choice-text">
              <ProseWithMath text={choice} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function NumericCapture({
  answer,
  onAnswer,
}: {
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  const initial = readField(answer, "value");
  const [value, setValue] = useState(typeof initial === "number" ? String(initial) : "");
  return (
    <label className="module-runner__field">
      <span className="sr-only">Numeric answer</span>
      <input
        type="number"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          const n = parseNum(next);
          onAnswer(n === null ? null : { value: n });
        }}
      />
    </label>
  );
}

function TwoCoordCapture({
  answer,
  field,
  onAnswer,
}: {
  answer: JsonValue | undefined;
  /** How to shape the serialized answer: bare `[x,y]` (vector) or `{vector:[x,y]}`. */
  field: "vector" | "construct";
  onAnswer: (answer: JsonValue | null) => void;
}) {
  const source =
    field === "vector"
      ? (Array.isArray(answer) ? answer : undefined)
      : readField(answer, "vector");
  const seed = (i: number) =>
    Array.isArray(source) && typeof source[i] === "number" ? String(source[i]) : "";
  const [x, setX] = useState(seed(0));
  const [y, setY] = useState(seed(1));

  const emit = (nx: string, ny: string) => {
    const px = parseNum(nx);
    const py = parseNum(ny);
    if (px === null || py === null) {
      onAnswer(null);
      return;
    }
    onAnswer(field === "vector" ? [px, py] : { vector: [px, py] });
  };

  return (
    <div className="module-runner__coords">
      <label className="module-runner__field">
        <span className="module-runner__coord-label">x</span>
        <input
          type="number"
          step="any"
          aria-label="x coordinate"
          value={x}
          onChange={(event) => {
            setX(event.target.value);
            emit(event.target.value, y);
          }}
        />
      </label>
      <label className="module-runner__field">
        <span className="module-runner__coord-label">y</span>
        <input
          type="number"
          step="any"
          aria-label="y coordinate"
          value={y}
          onChange={(event) => {
            setY(event.target.value);
            emit(x, event.target.value);
          }}
        />
      </label>
    </div>
  );
}

function VectorCapture(props: {
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  return <TwoCoordCapture {...props} field="vector" />;
}

function ConstructCapture(props: {
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  return <TwoCoordCapture {...props} field="construct" />;
}

function matrixConfig(exercise: ExerciseDefinition): MatrixEntryConfig | null {
  if (exercise.type !== "custom") return null;
  return (exercise.config as MatrixEntryConfig | undefined) ?? null;
}

function MatrixEntryCapture({
  exercise,
  answer,
  onAnswer,
}: {
  exercise: ExerciseDefinition;
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  const config = matrixConfig(exercise);
  const stored = readField(answer, "entries");
  const seed = (r: number, c: number): string => {
    if (Array.isArray(stored)) {
      const row = stored[r];
      if (Array.isArray(row) && typeof row[c] === "number") return String(row[c]);
    }
    return "";
  };
  const [grid, setGrid] = useState<string[][]>(() =>
    config
      ? Array.from({ length: config.rows }, (_, r) =>
          Array.from({ length: config.cols }, (_, c) => seed(r, c)),
        )
      : [],
  );
  if (!config) return null;

  const emit = (next: string[][]) => {
    const numbers: number[][] = [];
    for (const row of next) {
      const parsedRow: number[] = [];
      for (const cell of row) {
        const n = parseNum(cell);
        if (n === null) {
          onAnswer(null);
          return;
        }
        parsedRow.push(n);
      }
      numbers.push(parsedRow);
    }
    onAnswer({ entries: numbers });
  };

  return (
    <div
      className="module-runner__matrix"
      role="group"
      aria-label={`${config.matrixName ?? "Matrix"} entries`}
    >
      {grid.map((row, r) => (
        <div key={r} className="module-runner__matrix-row">
          {row.map((cell, c) => (
            <input
              key={c}
              type="number"
              step="any"
              inputMode="decimal"
              aria-label={`Row ${r + 1}, column ${c + 1}`}
              className="module-runner__matrix-cell"
              data-cell={`${r}-${c}`}
              value={cell}
              onChange={(event) => {
                const next = grid.map((gr, gri) =>
                  gr.map((gc, gci) => (gri === r && gci === c ? event.target.value : gc)),
                );
                setGrid(next);
                emit(next);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SelfCheckCapture({
  answer,
  onAnswer,
}: {
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  const initial = readField(answer, "text");
  const [text, setText] = useState(typeof initial === "string" ? initial : "");
  return (
    <label className="module-runner__field">
      <span className="sr-only">Your written answer</span>
      <textarea
        className="module-runner__textarea"
        rows={5}
        placeholder="Write your reasoning / proof…"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onAnswer({ text: event.target.value, selfMark: "not-yet" });
        }}
      />
    </label>
  );
}

function solutionSetVars(exercise: ExerciseDefinition): number {
  if (exercise.type !== "custom") return 0;
  const config = exercise.config as SolutionSetConfig | undefined;
  if (!config) return 0;
  return config.variables ?? config.matrix?.[0]?.length ?? 0;
}

/**
 * Produce a complete solution set: consistency, free-variable count, a
 * particular solution, and one nonzero null direction per free variable. The
 * number of directions is learner-chosen (Add / Remove) so the input NEVER
 * reveals the expected free count, and the completed formula is never shown
 * before commitment. Blank coordinates serialize as 0 (an explicit, gradeable
 * value) so a reloaded draft round-trips.
 */
function SolutionSetCapture({
  exercise,
  answer,
  onAnswer,
}: {
  exercise: ExerciseDefinition;
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  const n = solutionSetVars(exercise);
  const seedConsistent = (() => {
    const c = readField(answer, "consistent");
    return typeof c === "boolean" ? c : null;
  })();
  const seedVec = (raw: JsonValue | undefined): string[] =>
    Array.from({ length: n }, (_, i) =>
      Array.isArray(raw) && typeof raw[i] === "number" ? String(raw[i]) : "",
    );

  const [consistent, setConsistent] = useState<boolean | null>(seedConsistent);
  const [freeCount, setFreeCount] = useState<string>(() => {
    const fc = readField(answer, "freeCount");
    return typeof fc === "number" ? String(fc) : "";
  });
  const [particular, setParticular] = useState<string[]>(() =>
    seedVec(readField(answer, "particular")),
  );
  const [dirs, setDirs] = useState<string[][]>(() => {
    const stored = readField(answer, "nullDirections");
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map((d) => seedVec(d));
    }
    return [];
  });

  const emit = (
    c: boolean | null,
    fc: string,
    part: string[],
    ds: string[][],
  ) => {
    if (c === null) {
      onAnswer(null);
      return;
    }
    if (c === false) {
      onAnswer({ consistent: false });
      return;
    }
    // Blank cells serialize as `null` (a preserved draft), NEVER 0 — so every
    // expected component (including expected zeros) must actually be typed, and
    // clearing a field updates the stored answer instead of leaving a stale one.
    onAnswer({
      consistent: true,
      freeCount: parseNum(fc),
      particular: part.map((s) => parseNum(s)),
      nullDirections: ds.map((d) => d.map((s) => parseNum(s))),
    });
  };

  const coordRow = (
    values: string[],
    label: string,
    onCoord: (index: number, value: string) => void,
    testid: string,
  ) => (
    <div className="module-runner__coords" role="group" aria-label={label}>
      {values.map((value, i) => (
        <label key={i} className="module-runner__field">
          <span className="module-runner__coord-label">{`x${i + 1}`}</span>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            aria-label={`${label} component ${i + 1}`}
            data-testid={`${testid}-${i}`}
            value={value}
            onChange={(event) => onCoord(i, event.target.value)}
          />
        </label>
      ))}
    </div>
  );

  return (
    <div className="module-runner__solution-set">
      <div className="module-runner__choices" role="group" aria-label="Does the system have solutions?">
        <button
          type="button"
          className="module-runner__choice"
          aria-pressed={consistent === true}
          data-testid="solset-consistent"
          onClick={() => {
            setConsistent(true);
            emit(true, freeCount, particular, dirs);
          }}
        >
          Has solution(s)
        </button>
        <button
          type="button"
          className="module-runner__choice"
          aria-pressed={consistent === false}
          data-testid="solset-inconsistent"
          onClick={() => {
            setConsistent(false);
            emit(false, freeCount, particular, dirs);
          }}
        >
          No solution (∅)
        </button>
      </div>

      {consistent === true && (
        <div className="module-runner__solution-fields">
          <label className="module-runner__field module-runner__field--inline">
            <span className="module-runner__coord-label">Free variables</span>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              aria-label="Number of free variables"
              data-testid="solset-freecount"
              value={freeCount}
              onChange={(event) => {
                setFreeCount(event.target.value);
                emit(true, event.target.value, particular, dirs);
              }}
            />
          </label>

          <p className="module-runner__answer-label">Particular solution</p>
          {coordRow(
            particular,
            "Particular solution",
            (index, value) => {
              const next = particular.map((v, i) => (i === index ? value : v));
              setParticular(next);
              emit(true, freeCount, next, dirs);
            },
            "solset-particular",
          )}

          <p className="module-runner__answer-label">Null-space directions</p>
          {dirs.map((dir, di) => (
            <div key={di} className="module-runner__direction">
              {coordRow(
                dir,
                `Null direction ${di + 1}`,
                (index, value) => {
                  const next = dirs.map((d, i) =>
                    i === di ? d.map((v, j) => (j === index ? value : v)) : d,
                  );
                  setDirs(next);
                  emit(true, freeCount, particular, next);
                },
                `solset-direction-${di}`,
              )}
              <button
                type="button"
                className="module-runner__mini-button"
                data-testid={`solset-remove-${di}`}
                onClick={() => {
                  const next = dirs.filter((_, i) => i !== di);
                  setDirs(next);
                  emit(true, freeCount, particular, next);
                }}
              >
                Remove direction
              </button>
            </div>
          ))}
          <button
            type="button"
            className="module-runner__mini-button"
            data-testid="solset-add-direction"
            onClick={() => {
              const next = [...dirs, Array.from({ length: n }, () => "")];
              setDirs(next);
              emit(true, freeCount, particular, next);
            }}
          >
            + Add null direction
          </button>
        </div>
      )}
    </div>
  );
}

function eliminationDims(exercise: ExerciseDefinition): { m: number; n: number } {
  if (exercise.type !== "custom") return { m: 0, n: 0 };
  const config = exercise.config as EliminationConfig | undefined;
  const matrix = config?.matrix ?? [];
  const m = matrix.length;
  const n = config?.variables ?? matrix[0]?.length ?? 0;
  return { m, n };
}

function seedGrid(raw: JsonValue | undefined, rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (Array.isArray(raw)) {
        const row = raw[r];
        if (Array.isArray(row) && typeof row[c] === "number") return String(row[c]);
      }
      return "";
    }),
  );
}

function seedVec(raw: JsonValue | undefined, length: number): string[] {
  return Array.from({ length }, (_, i) =>
    Array.isArray(raw) && typeof raw[i] === "number" ? String(raw[i]) : "",
  );
}

/**
 * Produce concrete elimination evidence: a row-equivalent echelon augmented
 * matrix, pivot / free-variable identification, the free-variable count, and a
 * particular solution + null directions (consistent) — or a contradiction row
 * plus a TYPED classification (inconsistent). Blank cells serialize as `null`
 * (a preserved draft), never 0. Nothing about the expected reduction, pivots, or
 * free count is revealed before commitment.
 */
function EliminationCapture({
  exercise,
  answer,
  onAnswer,
}: {
  exercise: ExerciseDefinition;
  answer: JsonValue | undefined;
  onAnswer: (answer: JsonValue | null) => void;
}) {
  const { m, n } = eliminationDims(exercise);
  const augCols = n + 1;

  const [reduced, setReduced] = useState<string[][]>(() =>
    seedGrid(readField(answer, "reduced"), m, augCols),
  );
  const seedConsistent = (() => {
    const c = readField(answer, "consistent");
    return typeof c === "boolean" ? c : null;
  })();
  const [consistent, setConsistent] = useState<boolean | null>(seedConsistent);
  const [classification, setClassification] = useState<string>(() => {
    const c = readField(answer, "classification");
    return typeof c === "string" ? c : "";
  });
  const [pivots, setPivots] = useState<boolean[]>(() => {
    const stored = readField(answer, "pivotColumns");
    const set = new Set(Array.isArray(stored) ? stored.filter((x) => typeof x === "number") : []);
    return Array.from({ length: n }, (_, i) => set.has(i));
  });
  const [freeCount, setFreeCount] = useState<string>(() => {
    const fc = readField(answer, "freeCount");
    return typeof fc === "number" ? String(fc) : "";
  });
  const [particular, setParticular] = useState<string[]>(() =>
    seedVec(readField(answer, "particular"), n),
  );
  const [dirs, setDirs] = useState<string[][]>(() => {
    const stored = readField(answer, "nullDirections");
    if (Array.isArray(stored) && stored.length > 0) return stored.map((d) => seedVec(d, n));
    return [];
  });

  const emit = (next: {
    reduced?: string[][];
    consistent?: boolean | null;
    classification?: string;
    pivots?: boolean[];
    freeCount?: string;
    particular?: string[];
    dirs?: string[][];
  }) => {
    const R = next.reduced ?? reduced;
    const c = next.consistent ?? consistent;
    const cls = next.classification ?? classification;
    const pv = next.pivots ?? pivots;
    const fc = next.freeCount ?? freeCount;
    const part = next.particular ?? particular;
    const ds = next.dirs ?? dirs;

    const hasInput =
      c !== null ||
      R.some((row) => row.some((cell) => cell.trim() !== "")) ||
      cls.trim() !== "";
    if (!hasInput) {
      onAnswer(null);
      return;
    }
    const out: Record<string, JsonValue> = {
      reduced: R.map((row) => row.map((s) => parseNum(s))),
      consistent: c,
    };
    if (cls.trim() !== "") out.classification = cls;
    if (c === true) {
      out.pivotColumns = pv.flatMap((on, i) => (on ? [i] : []));
      out.freeCount = parseNum(fc);
      out.particular = part.map((s) => parseNum(s));
      out.nullDirections = ds.map((d) => d.map((s) => parseNum(s)));
    }
    onAnswer(out);
  };

  const coordRow = (
    values: string[],
    label: string,
    onCoord: (index: number, value: string) => void,
    testid: string,
  ) => (
    <div className="module-runner__coords" role="group" aria-label={label}>
      {values.map((value, i) => (
        <label key={i} className="module-runner__field">
          <span className="module-runner__coord-label">{`x${i + 1}`}</span>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            aria-label={`${label} component ${i + 1}`}
            data-testid={`${testid}-${i}`}
            value={value}
            onChange={(event) => onCoord(i, event.target.value)}
          />
        </label>
      ))}
    </div>
  );

  return (
    <div className="module-runner__solution-set">
      <p className="module-runner__answer-label">Row-reduce the augmented matrix</p>
      <div
        className="module-runner__matrix"
        role="group"
        aria-label="Row-reduced augmented matrix"
      >
        {reduced.map((row, r) => (
          <div key={r} className="module-runner__matrix-row">
            {row.map((cell, c) => (
              <input
                key={c}
                type="number"
                step="any"
                inputMode="decimal"
                aria-label={`Reduced row ${r + 1}, column ${c + 1}`}
                className="module-runner__matrix-cell"
                data-testid={`elim-cell-${r}-${c}`}
                value={cell}
                onChange={(event) => {
                  const nextGrid = reduced.map((gr, gri) =>
                    gr.map((gc, gci) => (gri === r && gci === c ? event.target.value : gc)),
                  );
                  setReduced(nextGrid);
                  emit({ reduced: nextGrid });
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div
        className="module-runner__choices"
        role="group"
        aria-label="Does the system have solutions?"
      >
        <button
          type="button"
          className="module-runner__choice"
          aria-pressed={consistent === true}
          data-testid="elim-consistent"
          onClick={() => {
            setConsistent(true);
            emit({ consistent: true });
          }}
        >
          Has solution(s)
        </button>
        <button
          type="button"
          className="module-runner__choice"
          aria-pressed={consistent === false}
          data-testid="elim-inconsistent"
          onClick={() => {
            setConsistent(false);
            emit({ consistent: false });
          }}
        >
          No solution (∅)
        </button>
      </div>

      {consistent === false && (
        <label className="module-runner__field">
          <span className="module-runner__coord-label">Classification</span>
          <input
            type="text"
            aria-label="Type the classification"
            placeholder='e.g. "none" / "inconsistent"'
            data-testid="elim-classification"
            value={classification}
            onChange={(event) => {
              setClassification(event.target.value);
              emit({ classification: event.target.value });
            }}
          />
        </label>
      )}

      {consistent === true && (
        <div className="module-runner__solution-fields">
          <p className="module-runner__answer-label">Mark the pivot columns</p>
          <div className="module-runner__choices" role="group" aria-label="Pivot columns">
            {pivots.map((on, i) => (
              <button
                key={i}
                type="button"
                className="module-runner__choice"
                aria-pressed={on}
                data-testid={`elim-pivot-${i}`}
                onClick={() => {
                  const next = pivots.map((p, pi) => (pi === i ? !p : p));
                  setPivots(next);
                  emit({ pivots: next });
                }}
              >
                {`x${i + 1}`}
              </button>
            ))}
          </div>

          <label className="module-runner__field module-runner__field--inline">
            <span className="module-runner__coord-label">Free variables</span>
            <input
              type="number"
              step="1"
              inputMode="numeric"
              aria-label="Number of free variables"
              data-testid="elim-freecount"
              value={freeCount}
              onChange={(event) => {
                setFreeCount(event.target.value);
                emit({ freeCount: event.target.value });
              }}
            />
          </label>

          <p className="module-runner__answer-label">Particular solution</p>
          {coordRow(
            particular,
            "Particular solution",
            (index, value) => {
              const next = particular.map((v, i) => (i === index ? value : v));
              setParticular(next);
              emit({ particular: next });
            },
            "elim-particular",
          )}

          <p className="module-runner__answer-label">Null-space directions</p>
          {dirs.map((dir, di) => (
            <div key={di} className="module-runner__direction">
              {coordRow(
                dir,
                `Null direction ${di + 1}`,
                (index, value) => {
                  const next = dirs.map((d, i) =>
                    i === di ? d.map((v, j) => (j === index ? value : v)) : d,
                  );
                  setDirs(next);
                  emit({ dirs: next });
                },
                `elim-direction-${di}`,
              )}
              <button
                type="button"
                className="module-runner__mini-button"
                data-testid={`elim-remove-${di}`}
                onClick={() => {
                  const next = dirs.filter((_, i) => i !== di);
                  setDirs(next);
                  emit({ dirs: next });
                }}
              >
                Remove direction
              </button>
            </div>
          ))}
          <button
            type="button"
            className="module-runner__mini-button"
            data-testid="elim-add-direction"
            onClick={() => {
              const next = [...dirs, Array.from({ length: n }, () => "")];
              setDirs(next);
              emit({ dirs: next });
            }}
          >
            + Add null direction
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Review (after release) — read-only stored answer + AutoResult + reveal.      */
/* -------------------------------------------------------------------------- */

/** Human-readable render of a stored, auto-gradable answer. */
function StoredAnswer({
  item,
  response,
}: {
  item: AttemptItemSnapshot;
  response: AttemptItemResponse | undefined;
}) {
  const answer = response?.answer;
  if (answer === undefined || answer === null) {
    return <span className="module-runner__answer-text">(left blank)</span>;
  }
  const exercise = definitionFromSnapshot(item);
  if (item.capabilityId === "multiple-choice" && exercise.type === "multiple-choice") {
    const choice = readField(answer, "choice");
    if (typeof choice === "number" && exercise.choices[choice] !== undefined) {
      return (
        <span className="module-runner__answer-text">
          {String.fromCharCode(65 + choice)}. <ProseWithMath text={exercise.choices[choice]!} />
        </span>
      );
    }
    return <span className="module-runner__answer-text">(left blank)</span>;
  }
  if (item.capabilityId === "numeric") {
    const value = readField(answer, "value");
    return <span className="module-runner__answer-text">{typeof value === "number" ? value : "(left blank)"}</span>;
  }
  if (item.capabilityId === "vector" && Array.isArray(answer)) {
    return <span className="module-runner__answer-text">({answer[0]}, {answer[1]})</span>;
  }
  if (item.capabilityId === CONSTRUCT_IN_EXPLORER_ID) {
    const v = readField(answer, "vector");
    if (Array.isArray(v)) return <span className="module-runner__answer-text">({v[0]}, {v[1]})</span>;
  }
  if (item.capabilityId === MATRIX_ENTRY_ID) {
    const entries = readField(answer, "entries");
    if (Array.isArray(entries)) {
      return (
        <span className="module-runner__answer-text">
          {entries
            .map((row) => (Array.isArray(row) ? `[${row.join(", ")}]` : ""))
            .join(" ")}
        </span>
      );
    }
  }
  if (item.capabilityId === SOLUTION_SET_ID) {
    const consistent = readField(answer, "consistent");
    if (consistent === false) {
      return <span className="module-runner__answer-text">No solution (∅)</span>;
    }
    const particular = readField(answer, "particular");
    const dirs = readField(answer, "nullDirections");
    const fc = readField(answer, "freeCount");
    const fmt = (v: JsonValue | undefined): string =>
      Array.isArray(v) ? `(${v.join(", ")})` : "—";
    return (
      <span className="module-runner__answer-text">
        {typeof fc === "number" ? `${fc} free var(s); ` : ""}
        particular {fmt(particular)}
        {Array.isArray(dirs) && dirs.length > 0
          ? `; directions ${dirs.map((d) => fmt(d)).join(", ")}`
          : ""}
      </span>
    );
  }
  if (item.capabilityId === ELIMINATION_ID) {
    const reduced = readField(answer, "reduced");
    const consistent = readField(answer, "consistent");
    const matrixText = Array.isArray(reduced)
      ? reduced
          .map((row) =>
            Array.isArray(row) ? `[${row.map((v) => (v === null ? "·" : v)).join(", ")}]` : "",
          )
          .join(" ")
      : "";
    if (consistent === false) {
      const cls = readField(answer, "classification");
      return (
        <span className="module-runner__answer-text">
          {matrixText}
          {matrixText ? " · " : ""}
          {typeof cls === "string" && cls.trim() !== "" ? cls : "No solution (∅)"}
        </span>
      );
    }
    const pivots = readField(answer, "pivotColumns");
    const particular = readField(answer, "particular");
    const dirs = readField(answer, "nullDirections");
    const fc = readField(answer, "freeCount");
    const fmt = (v: JsonValue | undefined): string =>
      Array.isArray(v) ? `(${v.map((x) => (x === null ? "·" : x)).join(", ")})` : "—";
    return (
      <span className="module-runner__answer-text">
        {matrixText}
        {matrixText ? " · " : ""}
        {Array.isArray(pivots) ? `pivots {${pivots.join(", ")}}; ` : ""}
        {typeof fc === "number" ? `${fc} free var(s); ` : ""}
        particular {fmt(particular)}
        {Array.isArray(dirs) && dirs.length > 0
          ? `; directions ${dirs.map((d) => fmt(d)).join(", ")}`
          : ""}
      </span>
    );
  }
  return <span className="module-runner__answer-text">(answer recorded)</span>;
}

/** Read-only review of an auto-graded item: stored answer + feedback + reveal. */
export function ReviewAnswer({
  item,
  response,
}: {
  item: AttemptItemSnapshot;
  response: AttemptItemResponse | undefined;
}) {
  const auto = response?.auto;
  const reveal =
    auto?.kind === "graded" && auto.solutionReveal
      ? (auto.solutionReveal as unknown as SolutionRevealData)
      : undefined;
  return (
    <div className="module-runner__auto">
      <p className="module-runner__answer-label">Your answer</p>
      <p>
        <StoredAnswer item={item} response={response} />
      </p>
      {auto?.kind === "graded" ? (
        <p className="module-runner__feedback" data-state={auto.correct ? "correct" : "incorrect"}>
          <ProseWithMath text={auto.feedback} />
        </p>
      ) : auto?.kind === "error" ? (
        <p className="module-runner__feedback" data-state="incorrect">
          Could not grade this answer.
        </p>
      ) : (
        <p className="module-runner__feedback" data-state="incorrect">
          Left blank.
        </p>
      )}
      {reveal && <SolutionReveal reveal={reveal} compact />}
    </div>
  );
}
