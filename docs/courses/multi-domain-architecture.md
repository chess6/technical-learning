# Multi-Domain Curriculum Architecture

How the current single-course curriculum model should evolve into a platform
that can hold many subjects, courses, modules, and lessons — with prerequisites,
shared lessons, and cross-domain connections — **without** over-building for a
POC that today ships one linear-algebra course and one algorithms lesson.

This is a planning document, not a spec to implement wholesale. It has three
horizons: **today** (what exists), **near-term** (the smallest next step), and
**long-term** (the graph-capable model). Each horizon is shippable on its own.

Read alongside:

- [product/vision.md](../product/vision.md) — §14 (the
  concept graph is the learner's internal model, not a syllabus) is the
  pedagogical justification for the long-term edges below.
- `.cursor/rules/project-core.mdc` — layering boundaries. This design keeps the
  flat lesson registry as the source of truth for lesson *content*; the
  curriculum tree only references lesson ids.

> **Proportionality note (durable).** This project is a desktop-first Vite /
> React / TS POC. Nothing here introduces a database, a backend, user accounts,
> or authored-content tooling until a horizon explicitly calls for it. The
> near-term schema is deliberately the *smallest* change that unblocks a second
> course; the long-term schema is a sketch of where the data model wants to go,
> not a mandate to build it now.

---

## 1. Where `COURSE_SECTIONS` stops scaling

The current model is two flat structures that quietly assume "one course, one
linear path."

**The registry is a single global ordered list.**
[src/lessons/registry.ts](../../src/lessons/registry.ts) exports
`lessons: LessonDefinition[]`, and *every* navigation and progress affordance is
derived from that array's index:

- `getAdjacentLessons(id)` returns `lessons[index-1]` / `lessons[index+1]` —
  Prev/Next is literally "the neighbor in one global array."
- `getLessonPosition(id)` returns `{ current: index+1, total: lessons.length }`
  — progress is *positional* against the whole registry, not against any path
  the learner is actually on.
- `getLessonIndex(id)` is used by the sidebar to decide prior/current/upcoming
  state and to print the lesson number.

This conflates three separate things into one array: **authoring order**
(which files exist), **the linear path a learner walks**, and **global
progress**. As soon as there is a second course, "lesson 5 of 5" and
"Next → Karatsuba after Eigenvectors" become nonsense: Karatsuba is not the
sequel to eigenvectors, it just happens to be next in the array.

**The course name is hardcoded.**
[src/components/layout/CourseSidebar.tsx](../../src/components/layout/CourseSidebar.tsx)
prints the literal string `Linear Algebra` / `Visual Learning`. There is no data
model for "which course am I in," so a second course cannot relabel the header.

**There is no subject / course / module nesting.**
[src/lessons/curriculum.ts](../../src/lessons/curriculum.ts) is a flat list of
`CourseSection`s. A `CourseSection` is a heading with items; there is no level
above it (subject, course) and the one level it has (section) is doing
double duty as "module." Karatsuba already sits awkwardly as an
`"Algorithms & complexity"` section *inside the Linear Algebra course* — the
model has no way to say "this is a different course."

**`future` items are string stubs, not nodes.**
A `CourseNavItem` of `kind: "future"` is `{ id, title }` — a label with no lesson
behind it. It cannot be a prerequisite, cannot be shared, cannot carry metadata,
and cannot be "promoted" to a real lesson without editing the tree by hand.

**No prerequisite edges.** Nothing records that transformations should precede
determinants, or that eigenvectors depends on both. Ordering is *implied* by
array position and by which section a lesson lands in — it is never stated, so
it cannot be validated or used for recommendations.

**A lesson lives in exactly one section.** Membership is by nesting: a
`CourseSection` *owns* its items. There is no way to place `eigenvectors` in both
a "Linear Algebra core" module and a "Dynamical systems foundations" module, or
to reuse a Fourier lesson in both a math path and a physics path. Sharing is
structurally impossible because the tree owns lessons rather than referencing
them.

**No cross-domain connection edges.** The concept graph in
product/vision.md §14 exists only as a Mermaid diagram in prose.
There is no data for "eigenvectors connects to nonlinear stability" that the UI
could surface as a *deeper connection* the way the vision document intends.

**Flat routing, no namespacing.**
[src/app/routes.tsx](../../src/app/routes.tsx) has exactly `/lesson/:lessonId`.
There is no `/subject/...`, `/course/...`, or `/module/...` segment, so a lesson
has no addressable context — the URL cannot express "eigenvectors, as reached via
the dynamical-systems path."

**Progress is positional, not per-path.** Because progress is `index+1 / total`
over the global array, it cannot answer the questions a multi-path platform
needs: "how far am I in *this course*," "have I met the prerequisites for
Fourier," "what is the next best lesson for me."

None of these are bugs today — they are the correct, minimal choices for one
course. They are simply the exact seams that a second subject will tear open.

---

## 2. Minimal near-term schema (the next step, not the platform)

**Goal:** support a *second course* and correct Prev/Next/progress, with the
smallest possible change. Explicitly **not** in scope near-term: prerequisite
graphs, cross-domain edges, learner accounts, persistence, recommendations. Those
are §3.

### Core decision: the tree references ids; the registry owns content

`LessonDefinition` and the flat `lessons[]` registry **stay exactly as they are**
and remain the single source of truth for lesson *content* (sections, guided
scene, exploration, worked examples, exercises). This preserves the
`project-core` layering rule and means zero lesson files change.

What changes is that `curriculum.ts` grows from a flat `CourseSection[]` into a
lightweight **subjects → courses → modules → lesson refs** tree, where the leaves
*reference* lesson ids rather than owning lessons. Because leaves are references,
the same lesson id may appear in more than one module — that is how "shared
lessons" become possible with no change to lesson content.

```ts
// curriculum.ts — near-term shape

/** A leaf in a module: either a real lesson (by id) or a placeholder node. */
export type ModuleItem =
  | { kind: "lesson"; lessonId: string }         // references registry
  | {
      // `future` is now a first-class node, not a bare string stub.
      kind: "future";
      id: string;
      title: string;
      subtitle?: string;
      /** Optional: the subject/topic it will belong to, for early wiring. */
      note?: string;
    };

export type Module = {
  id: string;
  title: string;
  /** Ordered items — this ordering defines Prev/Next *within the module*. */
  items: readonly ModuleItem[];
};

export type Course = {
  id: string;
  title: string;            // replaces the hardcoded "Linear Algebra"
  subtitle?: string;        // replaces the hardcoded "Visual Learning"
  modules: readonly Module[];
};

export type Subject = {
  id: string;               // "mathematics", "algorithms", ...
  title: string;
  courses: readonly Course[];
};

export const CURRICULUM: readonly Subject[] = [ /* see §5 */ ];
```

### What stays the same

- **`LessonDefinition`** — untouched. No new required fields.
- **`registry.ts` `lessons[]`** — still the content source of truth and still the
  set of lessons that actually exist. `getLessonById` is unchanged and is how the
  tree's `lessonId` refs resolve to content.
- **The six-phase lesson flow, math layering, all rendering** — untouched.

### What must change (and how)

**Prev/Next and progress become path-relative, not array-relative.** The
registry's global-array helpers (`getAdjacentLessons`, `getLessonPosition`) are
the wrong tool once there are multiple courses. Add *path-aware* helpers that
walk the active module (or course), not the global list:

```ts
// A "path" near-term is just: the ordered lesson ids of the active module
// (or the active course's modules concatenated). No graph yet.
function flattenCourseLessonIds(course: Course): string[] {
  return course.modules.flatMap((m) =>
    m.items.filter((i) => i.kind === "lesson").map((i) => i.lessonId),
  );
}

function getAdjacentInPath(pathIds: string[], lessonId: string) {
  const i = pathIds.indexOf(lessonId);
  return {
    previous: i > 0 ? pathIds[i - 1] : null,
    next: i >= 0 && i < pathIds.length - 1 ? pathIds[i + 1] : null,
  };
}

function getPositionInPath(pathIds: string[], lessonId: string) {
  const i = pathIds.indexOf(lessonId);
  return { current: i >= 0 ? i + 1 : 0, total: pathIds.length };
}
```

The old global helpers can remain temporarily (deprecated) so the migration is
incremental, but the sidebar and lesson layout switch to the path-aware versions.

**The sidebar reads course identity from data.** `CourseSidebar.tsx` stops
hardcoding `Linear Algebra` and instead renders the *active course*'s `title` /
`subtitle`, then iterates its `modules`. Lesson numbering becomes numbering
*within the active path*, not the global index. `future` items render the same
way they do today (a dimmed label), but now from a real node.

**Determining the active course near-term:** derive it from which course
contains the current `lessonId` (the first course whose flattened lesson ids
include it). This needs **no routing change yet** — `/lesson/:lessonId` still
works — which keeps the near-term step small. (Namespaced routing is deferred to
§3/§4.)

### Deliberately deferred (say so out loud)

- No prerequisite edges, no cycle validation.
- No cross-domain connection edges.
- No learner progress persistence, no recommendations.
- No routing changes (URLs stay `/lesson/:lessonId`).
- No backend, DB, or auth.
- Shared lessons are *possible* (an id can appear in two modules) but we do not
  yet need per-path progress to disambiguate them — a lesson is "done" globally.

This is enough to add a real second course, kill the hardcoded course name, and
make Prev/Next honest — and nothing more.

---

## 3. Longer-term schema (graph-capable)

When there are several subjects with genuinely interlinked content, the tree in
§2 is no longer expressive enough: it can only say "A is before B in this
module." The long-term model separates **nodes** (things that exist) from
**edges** (typed relationships between them) and layers **learning paths**
(named orderings) and **learner state** on top.

### Nodes

```ts
type Difficulty = "intro" | "core" | "advanced";

type LessonMeta = {
  difficulty: Difficulty;
  estimatedMinutes: number;
  tags: readonly string[];        // "linear-algebra", "spectral", "signals"
};

// Node ids are globally unique across the whole platform.
type SubjectNode = { kind: "subject"; id: string; title: string };
type CourseNode  = { kind: "course";  id: string; title: string; subtitle?: string; subjectId: string };
type ModuleNode  = { kind: "module";  id: string; title: string; courseId: string };

// A lesson node references registry content by `lessonId`; the registry still
// owns the LessonDefinition. `future` lessons have no lessonId yet.
type LessonNode = {
  kind: "lesson";
  id: string;                     // curriculum node id (stable, path-independent)
  lessonId?: string;              // resolves in registry; absent => not built yet
  status: "published" | "future";
  title: string;                  // shown even before content exists
  meta?: LessonMeta;
};

type CurriculumNode = SubjectNode | CourseNode | ModuleNode | LessonNode;
```

### Typed edges

Edges carry the relationships the tree could not express. The **type** of an
edge determines whether it gates the learner or merely enriches the experience.

```ts
type EdgeType =
  | "contains"                    // structural: subject→course→module→lesson
  | "prerequisite"                // HARD, directed, gating: B requires A
  | "ordered-next"               // default linear successor within a path
  | "shared-in-path"             // this lesson also belongs to another path
  | "cross-domain-connection"    // ADVISORY, not gating (see below)
  | "standalone";                // lesson intentionally has no ordering deps

type CurriculumEdge = {
  from: string;                  // node id
  to: string;                    // node id
  type: EdgeType;
  /** For advisory edges: a one-line "why these connect" for the UI. */
  note?: string;
};
```

**Hard prerequisites vs. advisory connections — the key distinction.**

- A `prerequisite` edge is a **gate**: it participates in "can the learner start
  this yet?" and in "what is the next best lesson?" It is directed and must not
  form a cycle (see validation below).
- A `cross-domain-connection` edge is **advisory**: it never blocks access and
  never orders a path. It exists to *surface a deeper connection* — exactly the
  concept-graph edges product/vision.md §14 describes ("strengthen
  existing edges, not merely add nodes"). Example: eigenvectors ↔ linear
  stability of a fixed point in nonlinear dynamics. The learner does not *need*
  eigenvectors to start nonlinear dynamics, but the platform should offer "you
  saw this idea before, here" as an optional bridge.

Keeping these two edge types distinct is what prevents the "everything is a
prerequisite" trap that would make the graph un-navigable.

### Learning paths

A **path** is a named ordering over lesson nodes — the thing that today's global
array pretends to be, now made explicit and plural. Multiple paths can traverse
the same lesson (that is `shared-in-path`).

```ts
type LearningPath = {
  id: string;                    // "linear-algebra-core", "signals-and-systems"
  title: string;
  subjectId: string;
  /** Ordered lesson node ids. Prev/Next and progress are relative to THIS. */
  lessonNodeIds: readonly string[];
  /** Which course/module framing to show while on this path. */
  primaryCourseId?: string;
};
```

Prev/Next and progress are computed against the *active path*, generalizing the
§2 path-aware helpers. Because a lesson can appear in multiple paths, per-path
progress (below) is what disambiguates "done here" from "done there."

### Learner progress and recommendation surface

This is the first horizon that implies **persistence** — see the backend note.

```ts
type LessonProgress = {
  lessonNodeId: string;
  mastery: number;               // 0..1, from checks/exercises
  lastVisitedAt: string;         // ISO timestamp
  completed: boolean;
};

type LearnerState = {
  learnerId: string;
  progress: Record<string, LessonProgress>;   // by lessonNodeId
  activePathId?: string;
};

// "Next best lesson": walk the prerequisite graph for nodes whose prereqs are
// all satisfied (mastery >= threshold), rank by path position + difficulty,
// and (optionally) surface advisory cross-domain connections as side-quests.
function nextBestLessons(state: LearnerState, graph: /* nodes+edges */ unknown): string[] {
  // 1. eligible = published lessons with all `prerequisite` edges satisfied
  // 2. prefer the active path's next unmet lesson
  // 3. append advisory `cross-domain-connection` targets as optional bridges
  return [];
}
```

### DAG / prerequisite validation

`prerequisite` and `contains` edges must form a **DAG** — no cycles — or "next
best lesson" and "are prerequisites met" can loop forever. Add a build-time
(test-time) validator:

- Topologically sort the subgraph of `prerequisite` edges; a failed sort means a
  cycle — fail the test with the offending nodes named.
- Every `prerequisite`/`ordered-next` edge must point at an existing node.
- Every `LessonNode` with `status: "published"` must have a resolvable
  `lessonId` in the registry (and vice-versa: no orphan registry lessons).
- `cross-domain-connection` edges are **exempt** from acyclicity — they are
  advisory and may point "backward" or form cycles freely (A connects to B and B
  connects to A is fine and even desirable).

### Where a real backend eventually enters

Everything through *paths* can stay as static TS data compiled into the bundle —
it is authored content, not user data. The line is crossed at **learner state**:
`LearnerState` / `LessonProgress` is per-user, mutable, and must persist across
sessions and devices. That is the first thing that genuinely needs storage
(local-first `localStorage`/IndexedDB is a reasonable *first* persistence step;
a real backend + accounts only when multi-device sync or teacher dashboards are
actually required). Recommendations can run entirely client-side over the static
graph + local progress until then. **Do not build the backend before learner
progress needs to outlive a browser tab.**

---

## 4. Migration path

Each step is independently shippable and preserves current behavior: the four
linear-algebra lessons and Karatsuba keep working, and Prev/Next for the default
path is unchanged.

### Step 0 — today (baseline)

Flat `lessons[]`, flat `COURSE_SECTIONS`, hardcoded course name, positional
progress, `/lesson/:lessonId`. Working, correct for one course.

### Step 1 — introduce the near-term tree behind the same behavior

- **`curriculum.ts`**: replace `COURSE_SECTIONS` with the `CURRICULUM: Subject[]`
  tree (§2). Encode today's content as one subject → one course → modules that
  mirror the current sections, so the sidebar output is byte-for-byte similar.
- **Test**: assert every `lessonId` referenced in the tree resolves via
  `getLessonById`, and that the default course's flattened lesson id order equals
  today's registry order (so Prev/Next does not move).

### Step 2 — path-aware Prev/Next and progress

- **`registry.ts`**: add `getAdjacentInPath` / `getPositionInPath` (§2); mark the
  global-array helpers deprecated but keep them until callers migrate.
- **`CourseSidebar.tsx` + lesson layout**: compute Prev/Next and the progress
  fraction from the active course's flattened path, not the global index.
- **Test**: for the single existing course, path-relative Prev/Next equals the
  old global Prev/Next (behavior preserved); add a synthetic second course in a
  test fixture to prove numbering restarts per course.

### Step 3 — data-driven course identity + first-class `future`

- **`CourseSidebar.tsx`**: render `course.title` / `course.subtitle` instead of
  the hardcoded `Linear Algebra` / `Visual Learning`; render `future` items from
  real nodes.
- **`curriculum.ts`**: add a genuine second course (e.g. Algorithms & Complexity
  as its own course rather than a section inside Linear Algebra) and at least one
  `future` node with metadata.
- **Test**: snapshot the sidebar for each course; assert `future` nodes render
  without a link.

### Step 4 — namespaced routing (optional, when a second course is real)

- **`routes.tsx`**: add `/course/:courseId/lesson/:lessonId` (or
  `/subject/:s/course/:c/lesson/:l`) while keeping `/lesson/:lessonId` as a
  redirect that resolves the lesson's default course. This is where a lesson
  finally gets addressable path context.
- **Test**: legacy `/lesson/:id` redirects to the namespaced URL; namespaced URL
  renders the correct course frame.

### Step 5 — graph model (long-term, only when interlinking is real)

- Introduce nodes + typed edges (§3) alongside the tree; the tree becomes a
  *view* derived from `contains` edges. Add the DAG validator test **first**.
- Add `LearningPath` records; make Prev/Next path-driven from the active path.
- Add advisory `cross-domain-connection` edges and a UI affordance ("deeper
  connection") that is purely optional.

### Step 6 — learner progress + recommendations (long-term)

- Add `LearnerState` with local-first persistence; compute `nextBestLessons`
  client-side. Introduce a backend only when progress must sync across devices.

**Touch points summary:** `curriculum.ts` (Steps 1, 3, 5), `registry.ts` helpers
(Step 2), `CourseSidebar.tsx` (Steps 2–3, 5), `routes.tsx` (Step 4). Lesson
content files and `LessonDefinition` are **not** touched by any step.

---

## 5. Example curriculum data

Concrete instances in the proposed schema. Real, already-implemented lesson ids
are `vectors`, `transformations`, `determinants`, `eigenvectors`, `karatsuba`;
everything else is a `future` node.

### Near-term tree (§2 shape)

```ts
export const CURRICULUM: readonly Subject[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    courses: [
      {
        id: "linear-algebra",
        title: "Linear Algebra",
        subtitle: "Visual Learning",
        modules: [
          {
            id: "foundations",
            title: "Foundations",
            items: [{ kind: "lesson", lessonId: "vectors" }],
          },
          {
            id: "transformations",
            title: "Transformations",
            items: [
              { kind: "lesson", lessonId: "transformations" },
              { kind: "lesson", lessonId: "determinants" },
              { kind: "lesson", lessonId: "eigenvectors" },
            ],
          },
          {
            id: "later",
            title: "Later topics",
            items: [
              { kind: "future", id: "change-of-basis", title: "Change of Basis" },
              { kind: "future", id: "svd", title: "Singular Value Decomposition" },
              // Fourier appears here AND in a physics path — see the graph below.
              { kind: "future", id: "fourier", title: "Fourier Transforms" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "algorithms",
    title: "Algorithms & Complexity",
    courses: [
      {
        id: "algorithmic-thinking",
        title: "Algorithmic Thinking",
        subtitle: "Divide, conquer, analyze",
        modules: [
          {
            id: "divide-and-conquer",
            title: "Divide & Conquer",
            items: [{ kind: "lesson", lessonId: "karatsuba" }],
          },
          {
            id: "data-structures",
            title: "Data Structures",
            items: [{ kind: "future", id: "red-black-trees", title: "Red-Black Trees" }],
          },
        ],
      },
    ],
  },
  {
    id: "complexity-science",
    title: "Complexity Science",
    courses: [
      {
        id: "dynamical-systems",
        title: "Dynamical Systems",
        subtitle: "How systems change over time",
        modules: [
          {
            id: "nonlinear-foundations",
            title: "Foundations",
            items: [{ kind: "future", id: "nonlinear-dynamics", title: "Nonlinear Dynamics" }],
          },
        ],
      },
    ],
  },
];
```

Note `fourier` deliberately appears under Linear Algebra's "Later topics"; the
long-term graph below lets the *same* Fourier lesson also live in a Physics /
Signals path (shared lesson) rather than being duplicated.

### Long-term nodes + edges (§3 shape)

```ts
const nodes: CurriculumNode[] = [
  { kind: "subject", id: "mathematics", title: "Mathematics" },
  { kind: "subject", id: "physics", title: "Physics" },
  { kind: "subject", id: "complexity-science", title: "Complexity Science" },
  { kind: "subject", id: "algorithms", title: "Algorithms & Complexity" },

  // Published lessons (resolve in the registry).
  { kind: "lesson", id: "n-vectors",        lessonId: "vectors",         status: "published", title: "Vectors, Combinations, Basis",
    meta: { difficulty: "intro", estimatedMinutes: 25, tags: ["linear-algebra"] } },
  { kind: "lesson", id: "n-transformations", lessonId: "transformations", status: "published", title: "Linear Transformations",
    meta: { difficulty: "core", estimatedMinutes: 30, tags: ["linear-algebra"] } },
  { kind: "lesson", id: "n-determinants",   lessonId: "determinants",    status: "published", title: "Determinants",
    meta: { difficulty: "core", estimatedMinutes: 30, tags: ["linear-algebra"] } },
  { kind: "lesson", id: "n-eigenvectors",   lessonId: "eigenvectors",    status: "published", title: "Eigenvectors",
    meta: { difficulty: "core", estimatedMinutes: 35, tags: ["linear-algebra", "spectral"] } },
  { kind: "lesson", id: "n-karatsuba",      lessonId: "karatsuba",       status: "published", title: "Karatsuba Multiplication",
    meta: { difficulty: "core", estimatedMinutes: 30, tags: ["algorithms", "divide-and-conquer"] } },

  // Future lessons (no lessonId yet).
  { kind: "lesson", id: "n-fourier",  status: "future", title: "Fourier Transforms",
    meta: { difficulty: "advanced", estimatedMinutes: 45, tags: ["spectral", "signals"] } },
  { kind: "lesson", id: "n-rbtree",   status: "future", title: "Red-Black Trees",
    meta: { difficulty: "core", estimatedMinutes: 40, tags: ["data-structures"] } },
  { kind: "lesson", id: "n-nonlinear", status: "future", title: "Nonlinear Dynamics",
    meta: { difficulty: "advanced", estimatedMinutes: 50, tags: ["dynamics", "stability"] } },
];

const edges: CurriculumEdge[] = [
  // Hard prerequisites (DAG).
  { from: "n-transformations", to: "n-determinants",  type: "prerequisite" },
  { from: "n-transformations", to: "n-eigenvectors",  type: "prerequisite" },
  { from: "n-determinants",    to: "n-eigenvectors",  type: "prerequisite" },
  { from: "n-vectors",         to: "n-transformations", type: "prerequisite" },

  // Default linear ordering within the linear-algebra path.
  { from: "n-vectors",         to: "n-transformations", type: "ordered-next" },
  { from: "n-transformations", to: "n-determinants",    type: "ordered-next" },
  { from: "n-determinants",    to: "n-eigenvectors",    type: "ordered-next" },

  // Fourier is shared between a math path and a physics/signals path.
  { from: "n-fourier", to: "n-fourier", type: "shared-in-path",
    note: "Same lesson in Linear Algebra 'Later topics' and Physics 'Signals'." },

  // Advisory cross-domain connections (NOT gating, never block access).
  { from: "n-eigenvectors", to: "n-nonlinear", type: "cross-domain-connection",
    note: "Linear stability of a fixed point is read off the Jacobian's eigenvalues." },
  { from: "n-eigenvectors", to: "n-fourier", type: "cross-domain-connection",
    note: "The DFT diagonalizes shift-invariant operators — eigenvectors of a circulant." },
];

const paths: LearningPath[] = [
  {
    id: "linear-algebra-core",
    title: "Linear Algebra",
    subjectId: "mathematics",
    lessonNodeIds: ["n-vectors", "n-transformations", "n-determinants", "n-eigenvectors", "n-fourier"],
    primaryCourseId: "linear-algebra",
  },
  {
    id: "signals-and-systems",
    title: "Signals & Systems",
    subjectId: "physics",
    // Fourier is reached here too — shared, not duplicated.
    lessonNodeIds: ["n-fourier", "n-nonlinear"],
  },
  {
    id: "algorithmic-thinking",
    title: "Algorithmic Thinking",
    subjectId: "algorithms",
    lessonNodeIds: ["n-karatsuba", "n-rbtree"],
  },
];
```

This example demonstrates every requested relationship:

- **Linear Algebra** as a course with the four existing lessons split across
  modules, prerequisites reflecting the real dependency order.
- **Algorithms & Complexity** as its own subject/course, with the implemented
  `karatsuba` lesson and a `red-black-trees` future lesson.
- **Fourier** as a `future` lesson that is **shared** between the math
  `linear-algebra-core` path and the physics `signals-and-systems` path (one
  lesson node, referenced by two paths) — plus a `cross-domain-connection` back
  to eigenvectors (the DFT-diagonalizes-circulants bridge, advisory).
- **Nonlinear dynamics** under Complexity Science / Physics, with an advisory
  `cross-domain-connection` to `eigenvectors` (linear stability from the
  Jacobian's spectrum) — a deeper connection, *not* a prerequisite that gates the
  lesson.

---

## 6. What is deliberately deferred

To keep the near-term step proportional to a POC, the following are explicitly
out of near-term scope and belong to §3/§4 Steps 5–6:

- Prerequisite edges and DAG validation.
- Cross-domain connection edges and the "deeper connection" UI.
- Named learning paths (near-term "path" is just the active course's lessons).
- Per-path / per-learner progress; today progress stays global-ish and
  positional within a course.
- Namespaced routing (`/course/...`); URLs stay `/lesson/:lessonId` near-term.
- Any backend, database, authentication, or content-authoring tooling.

The guiding rule: **build the tree now because a second course demands it; build
the graph only when lessons genuinely interlink across subjects; build the
backend only when learner progress must outlive the browser tab.**
