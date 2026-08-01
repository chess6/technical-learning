import type { FormalBlock } from "../../lessons/types";
import { ProseWithMath } from "./ProseWithMath";
import { DepthLayerList } from "./DepthLayer";
import "./FormalStatement.css";

const KIND_LABEL: Record<FormalBlock["kind"], string> = {
  definition: "Definition",
  proposition: "Proposition",
  theorem: "Theorem",
  corollary: "Corollary",
  conjecture: "Conjecture",
  lemma: "Lemma",
  axiom: "Axiom",
};

/**
 * A labeled, textbook-style formal block (definition / theorem / …). Reuses the
 * `ProseWithMath` + callout visual grammar. `revealed` justification lives in a
 * <details>; `reference` blocks render muted.
 *
 * `variant="proof"` (used only by a `proof` route block, never by a plain
 * `formal` reference to the same block) renders a DISTINCT, minimal block —
 * just the proof, labeled by which theorem it proves, ending in ∎ — rather
 * than repeating the statement/interpretation/layers a preceding `formal`
 * block for the same id already showed. A theorem's `proof` field is never
 * rendered by the `statement` variant, so the argument appears exactly where
 * its `proof` route block places it, and only there.
 */
export function FormalStatement({
  block,
  variant = "statement",
}: {
  block: FormalBlock;
  variant?: "statement" | "proof";
}) {
  const kindLabel = KIND_LABEL[block.kind];
  const heading = block.label ? `${kindLabel} — ${block.label}` : kindLabel;

  if (variant === "proof") {
    if (!block.proof) return null;
    return (
      <section
        className="formal-statement formal-statement--proof"
        data-kind={block.kind}
        data-testid={`proof-${block.id}`}
        aria-label={`Proof — ${heading}`}
      >
        <p className="formal-statement__proof-label">
          Proof{block.label ? ` (${heading})` : ` of the ${kindLabel.toLowerCase()}`}.
        </p>
        <p className="formal-statement__proof-body">
          <ProseWithMath text={block.proof} />
          <span className="formal-statement__proof-end" aria-hidden="true">
            {" "}
            ∎
          </span>
        </p>
      </section>
    );
  }

  return (
    <section
      className="formal-statement"
      data-kind={block.kind}
      data-visibility={block.visibility}
      data-testid={`formal-${block.id}`}
      aria-label={heading}
    >
      <p className="formal-statement__head">
        <span className="formal-statement__badge">{kindLabel}</span>
        {block.label && (
          <span className="formal-statement__label">{block.label}</span>
        )}
      </p>
      <p className="formal-statement__statement">
        <ProseWithMath text={block.statement} />
      </p>
      <p className="formal-statement__interpretation">
        <span className="formal-statement__interpretation-label">In words.</span>{" "}
        <ProseWithMath text={block.interpretation} />
      </p>
      {block.layers && block.layers.length > 0 && (
        <DepthLayerList layers={block.layers} />
      )}
    </section>
  );
}
