# Lesson / visualization correctness checklist

Use this as the reusable Gate-7 checklist for a new or substantially changed
lesson/visualization. Record the completed review and acceptance verdict in that
lesson’s `mastery-contract.md` §6; do not append lesson histories here. Git and
the lesson-owned record preserve the audit trail.

Reference [authoring/lesson-design.md](../authoring/lesson-design.md) (pedagogy,
notation, visual language), [engineering/math-correctness.md](../engineering/math-correctness.md)
(mathematics), and [quality/known-failure-modes.md](known-failure-modes.md).

## Mathematical review

- [ ] Every formula and displayed fixture is independently verified.
- [ ] `src/math` is the source of truth; renderers do not reimplement mathematics.
- [ ] Domains, hypotheses, degeneracies, non-finite inputs, and tolerance boundaries are explicit.
- [ ] Geometry/readouts are derived from the same tested values as the claim.
- [ ] The review searches sibling helpers and claims after fixing an invariant.
- [ ] No lesson or evidence claim exceeds what the implementation establishes.

## Visual review

- [ ] Labels, equations, accessible copy, and geometry describe the same live state.
- [ ] Critical labels remain unclipped and non-overlapping throughout motion.
- [ ] Motion shows the operation claimed; intermediate states are honest.
- [ ] Color has a redundant cue, reduced motion is meaningful, and focus order works.
- [ ] Math-space and screen-space transforms do not change mathematical meaning.

## Testing review

- [ ] Pure helpers and load-time fixture consistency have focused tests.
- [ ] Relevant adversarial/degenerate cases and invariants have regressions.
- [ ] Every auto-graded item has a grading contract and assessment-manifest entry.
- [ ] Learner-visible wiring/readouts have component coverage.
- [ ] New interactive capabilities have a real-browser spec.
- [ ] Applicable guided-scene hard gates pass when a scene changed.
- [ ] A genuinely new recurring defect class is added to `known-failure-modes.md`.
- [ ] The `AGENTS.md` verification tier ran; successful logs are summarized, not pasted here.

## Teaching review

- [ ] Visualization does not imply a false mathematical statement.
- [ ] Readouts and explanation text agree.
- [ ] Learner-facing notation uses KaTeX where appropriate.
- [ ] Prompts elicit the intended reasoning without cueing the method or answer.
- [ ] Feedback distinguishes related-but-wrong, incomplete, and blank responses.

## Acceptance record handoff

In the lesson’s `mastery-contract.md` §6, record only:

- scope and commit reviewed;
- reviewer independence and whether math + rendered-page review both ran;
- commands and concise results;
- defects found, regression guards added, and delta-verification result;
- unresolved risks or waivers;
- Gate-8 verdict and authorization basis.
