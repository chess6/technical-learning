# ADR 007 — The `/map` page: specified now, built when content justifies it

Status: **Accepted, implementation deferred** (2026-08-01), package R5 of
`feature/experience-architecture`

## Context

R4 and R5 built the curriculum graph as data: 88 concepts, 342 typed edges
(ADR-005), and four pathway overlays with validated prerequisite closure. The
redesign plan §5.2 pairs that data with a `/map` page — goal-first entry,
focus mode, readiness overlay, bridge offers.

Two facts about the current state decide this ADR:

1. **Most of what the map would show does not exist.** `applied-stem` requires
   46 lessons; **13 are built**. `math-major` requires 37; 17 are built. A map
   is a tool for navigating more material than a sidebar can hold — at 20 built
   lessons across three courses, `CourseSidebar` already does that job, and the
   map's honest content would be mostly "not built yet."
2. **The readiness overlay the plan specifies depends on R6.**
   `lessonProgress` and `exerciseAttempts` have zero non-platform readers;
   deriving the five mastery states is R6's deliverable, and the plan schedules
   R6 *after* R5.

Building the page now would produce a mostly-empty view of a mostly-unbuilt
curriculum, and would either ship without its readiness layer or pull R6
forward.

## Decision

**Specify the page fully now; build it when the content it navigates exists.**
The specification is the deliverable of this ADR — the design decisions are
made while the graph work is fresh, so implementation later is ordinary work
against a contract rather than a fresh design problem.

The repository owner set the sequencing directly: *build more content first,
map later.*

### Trigger to build

Build `/map` when **either** holds:

- a learner can complete a pathway's required set end to end (today: none —
  `cs-algorithms` is closest at 3 of 3 built, but its value is the optional
  FFT chain, which is unbuilt); **or**
- **two or more courses** have enough built lessons that cross-course
  navigation is a real task rather than a hypothetical one.

Until then the sidebar plus `CurriculumConnections` (shipped in R4, live on
15 of 20 lessons) carries navigation, and each is already graph-derived — so
the content work improves them for free.

### The contract

**Scope.** Read-only navigation over `src/curriculum/`. The page authors no
content and owns no curriculum data.

**1 — Entry: goal first, not graph first.**
The landing state is a short list of pathway cards, one per `Pathway`, showing
`title`, `goal`, and `audience`. `goal` leads — it is phrased as a capability
("Model change, accumulation, oscillation and fields…"), and that is the
question a learner can actually answer about themselves. No graph, no node
count, and no visualization renders before a pathway is chosen. Choosing one is
the primary filter and scopes everything after it.

A learner may also arrive with no goal; the page offers "browse by course" as a
secondary entry that renders the same track view scoped to one course.

**2 — Pathway track.**
The chosen pathway renders as a vertical spine: course → unit → node, in
curriculum order, using `requiredNodeIds` for the default (shortest) view.
Off-path prerequisites appear only as inbound markers on the node that needs
them, expandable in place — never as a second parallel list.

**3 — Focus mode, and the rule that keeps the page usable.**
Selecting a node opens its **local neighbourhood only**:

- what it `requires` (inbound, one hop),
- what it unlocks (outbound `requires`, one hop),
- labelled side-links for `same-structure-as` and `application-of`,
- a bridge offer where a `refresher-for` edge targets it.

**The full graph is never rendered, at any zoom, in any mode.** 342 edges laid
out at once is a picture of a curriculum, not a way to navigate one. One hop is
the contract; widening it is a new decision, not a tuning knob.

**4 — Unbuilt content is shown, and shown honestly.**
A pathway names mostly-unbuilt lessons, and hiding them would misrepresent the
route. Every node renders; a built one is a link, an unbuilt one is inert with
its authored title. This is exactly the rule `src/curriculum/labels.ts` already
enforces: **a node with no authored title is omitted entirely — an id is never
turned into a label by guessing.** The pathway header states built-vs-total
plainly ("13 of 46 built"), so the learner is never misled about what they can
walk today.

**5 — Shortest vs thorough.**
A toggle switches `requiredNodeIds` (default) and
`requiredNodeIds ∪ optionalNodeIds`. Optional nodes are visually distinct and
never reorder the required spine.

**6 — Accessibility is structural, not additive.**
The map is a **nested `<ul>`/`<details>` tree in DOM order with real links**,
readable and operable with no SVG present. Any diagram is decorative and
`aria-hidden`. This follows `semantic-page-grammar.md` §1 ("symbol or color
alone must not carry essential meaning") and is not negotiable against visual
ambition: if a layout cannot be expressed as that tree, the layout changes.

**Out of scope.** The readiness overlay — the five mastery states, per-node
progress, and any "you are here" marker — belongs to R6, which is where
`lessonProgress`/`exerciseAttempts` get wired and `mastery.ts` exists. The map
ships without it, and gains it as a layer over the same tree.

## Consequences

- The `/map` route does not exist yet; nothing regresses, and no dead UI ships.
- `pathways.ts` currently has **no runtime consumer**. This is a knowing,
  time-boxed exception to ADR-005's no-decoration rule, which the rule's own
  logic permits only because the consumer is specified and scheduled here
  rather than hoped for. If the trigger above is not met by the time R6 lands,
  the honest options are to build the page anyway *or* delete `pathways.ts` —
  not to let it sit indefinitely as data nothing reads.
- Content work (R7+) is now the critical path, and it directly improves the
  two graph consumers already live.
- A later ADR may widen focus mode past one hop; it should not need to reopen
  the entry or accessibility decisions.
