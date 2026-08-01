# ADR 005 — Curriculum graph as data (six edge types, consumer-gated)

Status: Accepted (2026-08), package R4 of `feature/experience-architecture`

## Context

`docs/courses/linear-algebra/curriculum-architecture.md` §2–§3 and
`docs/courses/applied-mathematics/curriculum-architecture.md` §2–§3 already
hold roughly 100 typed prerequisite/connection edges and 84 concept ids — as
Markdown tables. No `ConceptId` graph, edge, or pathway type exists in `src/`;
`src/platform/identity.ts` brands a `ConceptId` that nothing uses.
`courseModel.ts` states plainly that prerequisite edges, cross-domain
connections, and learning paths are "deliberately NOT built."
`multi-domain-architecture.md` §3 already sketches a graph-capable long-term
schema with nine edge types (`contains`, `prerequisite`, `ordered-next`,
`shared-in-path`, `cross-domain-connection`, `standalone`, plus six more named
in the redesign brief: `generalizes-to`, `special-case-of`,
`alternative-interpretation`, `analogous-to`,
`computational-implementation-of`, `misconception-related-to`).

Building all of that is exactly the "large generic content language before it
has several real consumers" the redesign brief warns against.

## Decision

**v1 ships six edge types, each required to have a named consumer that changes
learner-visible behavior before it is added:**

| Type | Consumer |
| --- | --- |
| `requires` | Hard, gating. DAG validation, prerequisite diagnosis, readiness claims. |
| `recommended-before` | Soft. Route ordering, "you'll get more from X first." |
| `refresher-for` | Bounded repair. Just-in-time bridge offer instead of a whole course. |
| `revisited-by` | Callback. Review scheduling (generalizes the existing hardcoded `SPACED_MODULE_ID` scheduler). |
| `same-structure-as` | Synthesis. Cross-course bridges (FTC ↔ Green ↔ Stokes; Karatsuba ↔ FFT). |
| `application-of` | Relevance. Pathway filtering, "why your major needs this." |

**Deferred until a consumer exists:** `generalizes-to`, `special-case-of`,
`alternative-interpretation`, `analogous-to`,
`computational-implementation-of`, `misconception-related-to`,
`historical-predecessor`. The rule is explicit and mechanical: an edge type
without code that reads it and changes what the learner sees is decoration,
and a test (`src/curriculum/__tests__/graph.test.ts`) asserts every `EdgeType`
in the union is read by at least one non-test module.

The existing Markdown tables are transcribed into `src/curriculum/edges.ts` /
`concepts.ts` and become the source of truth; the doc sections are rewritten to
point at the data rather than duplicate it (closing the drift risk the
applied-mathematics architecture doc already flags between its own concept
catalog and `src/lessons/glossary.ts`). `GlossaryTerm.prerequisites` migrates
from bare strings to resolvable `ConceptId`s.

`requires` and `recommended-before` are validated as a DAG (topological sort,
cycle detection naming the offending nodes); `same-structure-as` and
`application-of` are explicitly advisory and exempt from acyclicity, matching
`multi-domain-architecture.md` §3's existing distinction between hard and
advisory edges.

### Amendment (2026-08-01) — edge endpoints are typed refs, not bare ids

Shipped first with bare-string endpoints. A review found that unsound: an
endpoint may name a concept or a lesson, and **eight ids name both**
(`elimination`, `matrix-composition`, `rank-nullity`, `change-of-basis`,
`orthogonality`, `least-squares`, `series-convergence`, `laplace-transform`).
About 15% of endpoints resolved in either space, so no check over bare strings
could tell a correct endpoint from a wrong one. This was not hypothetical —
one `application-of` edge shipped with a lesson id where a concept was
required, unreachable by its only consumer.

An intermediate fix declared the intended namespace per edge type in a lookup
table and checked against it. That caught ids valid in only one space, but
still could not decide the eight collisions, and the comment describing it
overclaimed. It was replaced rather than kept.

Endpoints are now `NodeRef = { kind: "concept" | "lesson"; id }`, built through
`concept(...)` / `lesson(...)` (which also validate slug syntax via
`identity.ts`), and `CurriculumEdge` is a **union discriminated on `type`** that
pins each type's endpoint spaces. This closes the gap at both layers, which
neither layer does alone:

- **Compile time** — `{ type: "requires", from: concept("rank-nullity"), … }`
  is a `tsc` error. The ambiguity cannot be authored.
- **Run time** — `kind` survives into the data, so `graph.test.ts` resolves
  each endpoint against the catalog its own `kind` names, and graph nodes are
  keyed `kind:id` so the concept and the lesson `elimination` can never be
  conflated into one DAG node.

The general rule this sets: **when one string space carries two kinds of
identity, make the kind part of the value.** A validation table describing
what the strings are *supposed* to mean is weaker than a type that makes the
wrong thing unwritable.

## Consequences

- `src/curriculum/**` is new and depended on by nothing until the map page
  (R5) ships — it cannot regress any existing behavior by construction.
- The six-type v1 is narrower than both `multi-domain-architecture.md` §3's
  sketch and the eleven types the redesign brief lists. This is deliberate:
  the sketch is a menu, not a mandate, and this ADR is the record of which
  items off that menu shipped first and why.
- A later ADR may add a deferred edge type once a real consumer is identified;
  it should not require touching this decision's rationale, only extending the
  `EdgeType` union and adding the consumer.
- The curriculum-map page (R5) and the applied-mathematics course split (also
  R5) both depend on this data existing; neither is scheduled before this
  package's DAG validation is green.
